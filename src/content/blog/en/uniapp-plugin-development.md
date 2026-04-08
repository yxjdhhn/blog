---
title: >-
  How to Develop and Publish a uni-app Plugin: A Case Study of a Scan Input
  Component
description: >-
  Starting from a common scan input component in business scenarios, this
  article explains how to organize directories according to uni_modules
  specifications, perform local validation, and publish to the DCloud plugin
  market.
pubDate: '2026-03-16'
tags:
  - uni-app
  - frontend
  - plugins
  - experience
category: Technology
heroImage: ../../../assets/blog/generated/uniapp-plugin-development.png
draft: false
generatedFrom: zh
sourceHash: f08b45fba769d149c37df000a4ffb9e0a02ea81007d6e422f4cc911ab7a565e4
translationStatus: complete
imageStatus: complete
---
In day-to-day business, what often gets reinvented repeatedly isn't complex pages, but those foundational components that every project needs, yet their implementations always seem to differ slightly. Scan-to-input is a classic example.

In scenarios like warehousing, quality inspection, and inbound/outbound management, there's often a need for an input area that can connect to a barcode scanner, allow manual entry, and maintain focus as much as possible. If each project writes its own version, it might seem convenient at first, but chaos ensues later: code duplication, difficult version management, fixed bugs not easily synchronized, and component standards becoming increasingly fragmented.

A more practical approach is to extract such components into `uni_modules` plugins. They can be directly reused across projects, and if organized thoroughly enough, they can also be conveniently published to the DCloud plugin market.

This article uses a `scan-section` scan-to-input component as an example to clarify three things: how to structure the plugin directory, what each key file is responsible for, and what pitfalls are most commonly encountered during publishing.

<div class="article-callout">
  <p class="article-kicker">Key Takeaways First</p>
  <ul>
    <li>This type of business component is well-suited for extraction into a <code>uni_modules</code> plugin. In the long run, it's much more efficient than copying code across multiple projects.</li>
    <li>During development, the most critical files are just a few: <code>scan-section.vue</code>, <code>index.js</code>, <code>package.json</code>, <code>uni_modules.json</code>, and <code>readme.md</code>.</li>
    <li>Before publishing, focus on checking three things: whether the <code>id</code> is consistent, whether the documentation and screenshots are complete, and whether the component depends on any third-party UI libraries unsuitable for listing.</li>
  </ul>
</div>

## Why Turn Business Components into Plugins

In real-world projects, there are many reusable components, such as:

-   Scan-to-input components
-   Generic form components
-   Modal dialog components
-   Permission control components

If these components remain scattered across different repositories, problems quickly arise:

-   The same functionality gets redeveloped repeatedly
-   Version updates become difficult to synchronize
-   Technical assets fail to accumulate effectively
-   Component standards within the team become increasingly chaotic

Therefore, the starting point of this article is simple: extract stable, highly reusable components from business logic and package them as UniApp plugins that can be directly integrated into multiple projects.

## This Technology Stack

I used the following combination for this project:

- Framework: `Vue3`
- Cross-platform solution: `UniApp`
- Plugin specification: `uni_modules`
- Publishing platform: `DCloud Plugin Marketplace`

The reasons are fairly straightforward:

1. `UniApp` inherently covers common platforms like `H5`, `App`, and Mini Programs.
2. `uni_modules` is the officially recommended plugin specification, offering a more unified directory structure and publishing method.
3. The Composition API in `Vue3` makes organizing component logic more intuitive and facilitates future extensions.

## How to Organize the Plugin Directory

First, let's look at the directory structure. In this example, I'm placing it according to the standard `uni_modules` format:

```text
uni_modules/
└── scan-section/
    ├── components/
    │   └── scan-section/
    │       └── scan-section.vue
    ├── index.js
    ├── package.json
    ├── uni_modules.json
    └── readme.md
```

Now, let's break it down file by file.

### Core Component: `scan-section.vue`

This component primarily addresses several issues:

- Simultaneously supports barcode scanner input and manual entry
- Automatically clears content after confirmation is triggered
- Uses dual input field switching to minimize focus conflicts during continuous scanning
- Exposes `focusInput` externally, facilitating active focus control by the page

The core implementation is as follows:

```vue
<template>
  <view class="scan-section">
    <!-- Title Area -->
    <view class="section-header">
      <view class="section-title">
        <text class="section-desc">{{ title }}</text>
        <text v-if="formatDesc" class="format-desc">{{ formatDesc }}</text>
        <slot name="title-extra"></slot>
      </view>
      <slot name="header-right"></slot>
    </view>

    <!-- Input Area -->
    <view class="scan-input-area">
      <template v-if="inputToggle">
        <input
          ref="inputRef"
          class="scan-input"
          :value="localValue"
          :placeholder="placeholder"
          :focus="autoFocus"
          :disabled="disabled"
          confirm-type="done"
          @input="handleInput"
          @confirm="handleConfirm"
          @blur="handleBlur"
        />
      </template>

      <template v-else>
        <input
          ref="inputRefAlt"
          class="scan-input"
          :value="localValue"
          :placeholder="placeholder"
          :focus="autoFocus"
          :disabled="disabled"
          confirm-type="done"
          @input="handleInput"
          @confirm="handleConfirm"
          @blur="handleBlur"
        />
      </template>
    </view>

    <!-- Buttons -->
    <view v-if="showSearchButton" class="scan-buttons">
      <button
        class="search-btn"
        type="primary"
        :disabled="loading"
        @click="handleConfirm"
      >
        {{ loading ? "Processing..." : searchButtonText }}
      </button>

      <button
        class="reset-btn"
        type="default"
        @click="handleReset"
      >
        {{ resetButtonText }}
      </button>
    </view>

    <slot name="extra"></slot>
  </view>
</template>

<script setup>
import { ref, watch, nextTick } from "vue"

defineOptions({
  name: "ScanSection"
})

/* Props */
const props = defineProps({
  title: { type: String, required: true },
  formatDesc: { type: String, default: "" },
  placeholder: { type: String, default: "Please scan or enter" },
  searchButtonText: { type: String, default: "Search" },
  resetButtonText: { type: String, default: "Reset" },
  modelValue: { type: String, default: "" },
  autoFocus: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  showSearchButton: { type: Boolean, default: true },
  debounceTime: { type: Number, default: 1500 }
})

/* Emits */
const emit = defineEmits(["update:modelValue", "confirm", "blur", "reset"])

/* Local Value */
const localValue = ref(props.modelValue)

watch(() => props.modelValue, val => {
  localValue.value = val
})

watch(localValue, val => {
  emit("update:modelValue", val)
})

/* Dual Input Toggle */
const inputToggle = ref(true)
const inputRef = ref(null)
const inputRefAlt = ref(null)

/* Debounce + Lock */
let scanTimer = null
const isProcessing = ref(false)

/* Input */
const handleInput = (e) => {
  localValue.value = e.detail.value
}

/* Confirm */
const handleConfirm = () => {
  if (isProcessing.value) return
  if (!localValue.value) return

  isProcessing.value = true

  if (scanTimer) clearTimeout(scanTimer)

  scanTimer = setTimeout(() => {
    emit("confirm", localValue.value)

    localValue.value = ""
    inputToggle.value = !inputToggle.value

    nextTick(() => {
      focusInput(true)
    })

    isProcessing.value = false
  }, props.debounceTime)
}

/* Reset */
const handleReset = () => {
  localValue.value = ""
  emit("reset")

  inputToggle.value = !inputToggle.value

  nextTick(() => {
    focusInput(true)
  })
}

/* Blur */
const handleBlur = (e) => {
  emit("blur", e)
}

/* Focus Method */
const focusInput = (hideKeyboard = true) => {
  const current = inputToggle.value ? inputRef.value : inputRefAlt.value
  if (!current) return

  try {
    current.focus()
    if (hideKeyboard) {
      setTimeout(() => uni.hideKeyboard(), 30)
    }
  } catch (e) {
    console.error("focus error:", e)
  }
}

/* Exposed Methods */
defineExpose({
  focusInput
})
</script>

<style scoped lang="scss">
.scan-section {
  background: #ffffff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 20rpx;
}

.section-desc {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.format-desc {
  font-size: 24rpx;
  color: #666;
}

.scan-input {
  height: 80rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  margin-top: 20rpx;
}

.scan-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;
}

.search-btn,
.reset-btn {
  flex: 1;
  margin: 0 10rpx;
  height: 80rpx;
  font-size: 28rpx;
  border-radius: 8rpx;
}

.search-btn {
  margin-left: 0;
}

.reset-btn {
  margin-right: 0;
}
</style>
```

If your scenario also involves continuous scanning, the most noteworthy part here is the "dual input field switching" section. It's not overly complex but highly practical, effectively preventing many issues related to focus loss and input conflicts.

### Plugin Entry: `index.js`

The entry file has a single responsibility: to register the component so that the host project can directly use `app.use()`:

```js
import ScanSection from './components/scan-section/scan-section.vue'

const install = (app) => {
  app.component(ScanSection.name, ScanSection)
}

export default { install }
export { ScanSection }
```

### Plugin Basic Information: `package.json`

The `package.json` file is primarily responsible for declaring the plugin's own information and platform support:

```json
{
  "id": "scan-section",
  "name": "scan-section",
  "version": "1.0.0",
  "description": "Vue3 + UniApp Universal Scan Input Component",
  "keywords": [
    "Scan",
    "scan",
    "barcode",
    "uni-app"
  ],
  "uni_modules": {
    "platforms": {
      "app": {
        "android": true,
        "ios": true
      },
      "h5": true,
      "mp-weixin": true,
      "cloud": {
        "tcb": "-",
        "aliyun": "-",
        "alipay": "-"
      }
    }
  },
  "dcloudext": {
    "type": "",
    "sale": {
      "regular": {
        "price": "0.00"
      },
      "sourcecode": {
        "price": "0.00"
      }
    },
    "contact": {
      "qq": ""
    },
    "declaration": {
      "ads": "",
      "data": "",
      "permissions": ""
    },
    "npmurl": "",
    "darkmode": "-",
    "i18n": "-",
    "widescreen": "-"
  },
  "engines": {
    "HBuilderX": "^3.1.0",
    "uni-app": "^3.1.0",
    "uni-app-x": "^3.1.0"
  }
}
```

There is a crucial detail to check later: the `id` must not be omitted and must match the one in `uni_modules.json`. If they are inconsistent, an error will be reported directly during the publishing stage.

### Plugin Marketplace Display Information: `uni_modules.json`

This file focuses more on "listing information," controlling how the plugin is displayed in the marketplace:

```json
{
  "id": "scan-section",
  "displayName": "ScanSection Industrial-Grade Scan Input Component",
  "version": "1.0.0",
  "description": "A universal scanning component supporting barcode scanners/QR codes/manual input, featuring debounce mechanism and auto-focus",
  "keywords": ["scan", "industrial scanning", "barcode"],
  "dcloudext": {
    "category": ["Frontend Components"],
    "sale": {
      "price": "0"
    }
  }
}
```

### Documentation: `readme.md`

`readme.md` is not just supplementary material; it essentially determines whether others can understand how to integrate your plugin. At a minimum, you must clearly describe the features, integration methods, and basic usage.

An example can be written to this extent:

````md
# ScanSection Industrial-Grade Scan-to-Input Component

## Features

- Supports barcode scanner input
- Supports manual input
- Debounce handling
- Dual input field switching to prevent conflicts
- Auto-focus
- v-model two-way binding
- Supports H5 / App / Mini Programs

## Usage

Register in `main.js`:

```js
import ScanSection from '@/uni_modules/scan-section'

app.use(ScanSection)
```
````

## How to Integrate and Test Locally

After writing the plugin, don't rush to publish it. First, integrate it into a local project and run it.

First, register it globally in `main.js`:

```js
import { createSSRApp } from 'vue'
import App from './App.vue'
import ScanSection from '@/uni_modules/scan-section'

export function createApp() {
  const app = createSSRApp(App)
  app.use(ScanSection)
  return {
    app
  }
}
```

Then use it directly in a page:

```vue
<template>
  <view style="padding:40rpx;">
    <ScanSection
      v-model="code"
      title="Scan Test"
      @confirm="handleConfirm"
    />
  </view>
  <view style="padding-left:70rpx;">
    {{ result }}
  </view>
</template>

<script setup>
import { ref } from 'vue'

const code = ref("")
const result = ref('')

const handleConfirm = (val) => {
  result.value = `Scan Result: ${val}`
}
</script>
```

During local verification, ensure at least these items work:

- The component can be registered normally.
- Both scanning and manual input can be triggered.
- Clear, reset, and refocus behaviors meet expectations.
- There are no significant differences in behavior between the `H5` and `App` platforms.

## What Each Key File Is Responsible For

If you want a quick recap, the most critical parts of the entire plugin are the following:

- `components/`: Contains the specific component implementations.
- `index.js`: The plugin entry point, providing an `install` method so external projects can use `app.use()`.
- `package.json`: Defines the plugin's basic information, version, and platform support declarations.
- `uni_modules.json`: Defines the plugin marketplace display information, such as name, category, description, and price.
- `readme.md`: Contains usage instructions, which should at least include feature introduction, integration methods, parameters, and events.

One of the most commonly overlooked points is the `id` in `package.json`. It must be consistent with the one in `uni_modules.json`, otherwise issues will arise during the submission process.

## What to Do Before Publishing to the Plugin Market

The entire publishing process isn't actually complicated. I usually follow this order.

### 1. Developing Within a UniApp Project

This plugin is released according to the `UniApp` specification, so the development phase itself should be completed within a `UniApp` project. This ensures consistency in the directory structure, debugging methods, and the final release format, minimizing the need for rework later on.

### 2. Perform Local Verification First

Before the official release, make sure you have gone through the following basic checks:

-   Registration is completed in `main.js`.
-   The component has been actually called in a page.
-   Key functionalities have been tested.
-   At least `H5` and `App` platforms have been verified.

Submitting the process will be much more stable once you confirm there are no issues.

If you are using HBuilderX, you can directly right-click on the `uni_modules` directory in your project and select "Publish to Plugin Market" to access the publishing entry.

### 3. Prepare Release Materials

Beyond the code itself, you typically need to prepare the following content:

1.  Changelog
2.  Plugin preview screenshots
3.  Usage documentation

The changelog doesn't need to be an essay; just clearly state what was changed in this update. Avoid repeating the explanations already present in the `readme`.

### 4. Complete Real-Name Verification

To publish on the DCloud plugin marketplace, you must first complete real-name verification for your account. This step is mandatory; you can only formally submit your plugin for review after passing the verification.

## The Pitfalls I Encountered

### `id` Cannot Be Empty

This issue is the most straightforward and common.

The reason is that the `id` field is not filled in `package.json`, or if it is filled, it does not match the entry in `uni_modules.json`. The solution is simple: add the `id` and ensure the two files are completely consistent.

### Screenshot Upload Failed

When I encountered this issue, it was usually due to these two reasons:

- The filename contained Chinese characters.
- The built-in upload window in HBuilderX was unstable.

If you run into this, the easiest solution is to rename the file to use English characters and then upload it directly via the web portal:

[https://ext.dcloud.net.cn/](https://ext.dcloud.net.cn/)

### Relying on Third-Party UI Components

This pitfall is quite subtle. For convenience during development, if a component directly depends on certain third-party UI libraries, it can introduce additional issues during the review stage, potentially even affecting approval.

My later approach was to try and convert it to a dependency-free version, implementing basic interactions and styles directly with native components. This makes integration lighter for users and ensures a more stable review process.

## What's Next

If this type of component has started to be stably reused within the team, you can proceed with the following steps:

- Build an internal component library
- Implement unified version management
- Gradually plugin-ify more common business components

This step isn't strictly mandatory, but if your team has multiple UniApp projects running in parallel long-term, consolidating early will save a lot of repetitive work down the line.
