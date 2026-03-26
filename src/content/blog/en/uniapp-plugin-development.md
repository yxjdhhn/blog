---
title: UniApp Plugin Development and Publishing
description: Develop and publish reusable components to enhance development efficiency.
pubDate: '2026-03-16'
tags:
  - UniApp
  - Frontend
  - Plugin
  - Experience
category: Technology
heroImage: ../../../assets/blog/generated/uniapp-plugin-development.png
draft: false
generatedFrom: zh
sourceHash: 406ac23a5c4019ef6292a1f64c735140c7a4ca56e8ece2a2808d5f28e5b33e6e
translationStatus: complete
imageStatus: complete
---
## **I. Plugin Development and Publishing**

During daily business development, there are numerous reusable components, such as:

-   Scan-to-input components
-   Generic form components
-   Modal dialog components
-   Permission control components

These components are often redeveloped across multiple projects, leading to:

-   High code duplication rates
-   Chaotic version maintenance
-   Inability to accumulate technical assets
-   Difficulty in unifying component standards

To improve development efficiency, these components can be abstracted into reusable plugins and published to the UniApp Plugin Market, enabling component assetization and standardized management.

## **II. Technology Stack Selection**

Based on the following technology stack:

-   Framework: Vue3
-   Cross-platform Framework: UniApp
-   Plugin Specification: uni_modules Standard
-   Publishing Platform: DCloud Plugin Marketplace

Reasons for Selection:

1.  UniApp supports multi-platform publishing (H5 / App / Mini Programs).
2.  uni_modules is the official plugin standard.
3.  Vue3 offers better support for the Composition API.

## **三、插件结构设计**

The plugin adopts the officially recommended uni_modules directory specification:

```
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

scan-section.vue

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

index.js

```js
import ScanSection from './components/scan-section/scan-section.vue'

const install = (app) => {
  app.component(ScanSection.name, ScanSection)
}

export default { install }
export { ScanSection }

```

package.json

```json
{
  "id": "scan-section",
  "name": "scan-section",
  "version": "1.0.0",
  "description": "A universal scan input component for Vue3 + UniApp",
  "keywords": [
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

readme.md

```md
# ScanSection Industrial-Grade Scan Input Component

## Features

- Supports barcode scanner input
- Supports manual input
- Debounce handling
- Dual input field switching to prevent conflicts
- Auto-focus
- v-model two-way binding
- Supports H5 / App / Mini Programs

## Usage
Register in main.js:
import ScanSection from '@/uni_modules/scan-section'
app.use(ScanSection)

```

uni_modules.json

```json
{
  "id": "scan-section",
  "displayName": "ScanSection Industrial-Grade Scan Input Component",
  "version": "1.0.0",
  "description": "A universal scan component supporting barcode scanners/QR codes/manual input, featuring debounce mechanism and auto-focus",
  "keywords": ["scan", "industrial scanning", "barcode"],
  "dcloudext": {
    "category": ["Frontend Components"],
    "sale": {
      "price": "0"
    }
  }
}
```

##### **Testing and Usage**

`Global registration in main.js`

```js
import { createSSRApp } from 'vue'
import App from './App.vue'
import ScanSection from '@/uni_modules/scan-section'

export function createApp() {
  const app = createSSRApp(App)
  app.use(ScanSection)   // Register here
  return {
    app
  }
}
```

`Using the component`

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
  	{{result}}
  </view>
</template>

<script setup>
import { ref } from 'vue'

const code = ref("")
const result= ref('')
const handleConfirm = (val) => {
  result.value=`Scan Result: ${val}`
}
</script>
```

#### **Key File Descriptions**

**1. components/**

Contains the specific component implementations.

##### **2. index.js**

The plugin entry file, responsible for registering components.

Purpose:

- Provides the install method
- Supports app.use() invocation

##### **3. package.json**

Defines the plugin's basic information.

Key fields:

- id (required)
- name
- version
- uni_modules platform support declaration

Note:

The id in package.json must match the one in uni_modules.json, otherwise publishing will fail.

##### **4. uni_modules.json**

Used to configure the display information for the plugin market, including:

- Plugin name
- Category
- Description
- Whether it's paid

##### **5. readme.md**

The plugin usage documentation, containing:

- Feature introduction
- Usage instructions
- Parameter descriptions
- Event descriptions

## **IV. Plugin Publishing Process**

#### 1. Create a Vue3 UniApp Project

Plugins must be developed and published within a UniApp project.

#### 2. Local Testing

The steps include:

-   Registering the plugin in `main.js`
-   Calling the component in pages
-   Running and verifying on multiple platforms (H5 / App)

Ensure the functionality is stable before publishing.

**You can publish directly by right-clicking on the plugin under `uni_modules` within the project and selecting "Publish to Plugin Marketplace".**

#### 3. Prepare Publishing Materials

These include:

1.  Changelog
2.  Plugin preview screenshots
3.  Usage documentation

The changelog should briefly describe the content of this update; there is no need to repeat the documentation.

#### 4. Real-Name Verification

Account real-name verification must be completed before publishing to the Plugin Marketplace.

You can only submit for review after verification is passed.

## **V. Issues Encountered During Practice**

#### 1. Plugin ID Cannot Be Empty

**Cause:**

The `id` field is missing in `package.json`.

**Solution:**

Add the `id` field and ensure it matches the value in `uni_modules.json`.

#### 2. Screenshot Upload Fails

**Possible Causes:**

-   Filename contains Chinese characters.
-   Issues with the HBuilderX embedded browser window.

**Solution:**

Upload via the web portal at [https://ext.dcloud.net.cn/](https://ext.dcloud.net.cn/) and use English filenames.

#### 3. Dependency on Third-Party UI Components

This may cause the plugin to fail review.

**Solution:**

Create a dependency-free version by implementing the features using native components.

## **Future Expansion Possibilities:**

- Establish an internal component library system
- Implement unified component version management
- Promote the modularization of more business components into plugins
