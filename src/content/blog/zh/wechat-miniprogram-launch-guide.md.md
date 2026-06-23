---
title: 微信小程序从 0 到上线：注册、开发、提审与发布避坑
description: 这篇笔记介绍一些在小程序发布前、中、后期的一些注意事项。
pubDate: '2026-06-23'
tags:
  - 小程序
  - 工程化
category: 技术
draft: true
---

# 微信小程序从 0 到上线：注册、开发、提审与发布避坑

把“从注册到发布”的整条链路跑通，并把容易踩坑的地方提前暴露。

## 一、完整上线链路

一个微信小程序从 0 到上线，大致可以拆成下面几步：

```text
注册小程序账号
完善主体信息和服务类目
获取 AppID
添加项目成员
安装 HBuilderX 和微信开发者工具
创建 uni-app 项目
配置 manifest.json 和 pages.json
跑通开发版真机预览
部署后端 HTTPS 服务
配置服务器合法域名
完善隐私保护指引
处理代码包体积和分包
上传代码
提交审核
审核通过后发布
正式版回归验证
```

注意，这不是“写完代码再上线”的流程，而是“开发前就要为上线做准备”的流程。比如服务类目、接口权限、合法域名、隐私协议，如果等功能都写完才检查，返工成本会非常高。

## 二、开发前准备：账号、AppID、权限和类目

开发小程序的第一步，是注册小程序账号。进入微信公众平台，选择注册小程序，按提示填写邮箱、主体信息并提交资料。注册完成后，登录小程序后台，在下面位置可以看到小程序的 `AppID`：

```text
微信公众平台 -> 开发 -> 开发设置
```

`AppID` 是小程序在微信平台上的身份标识。后面创建项目、配置 `manifest.json`、导入微信开发者工具、上传代码都会用到它。

这里有几个很常见的坑。

第一，别把小程序 `AppID` 和公众号、服务号的 `AppID` 搞混。它们看起来都是一串以 `wx` 开头的字符串，但不是同一个应用身份。

第二，`AppID` 是“小程序是谁”的公开标识。比如在 `manifest.json` 、微信开发者工具里配置`AppID` ，微信就知道这个项目对应哪个小程序。它可以出现在前端配置里。 `AppSecret` 是“小程序的后台密码”。它用于服务端调用微信开放接口，比如获取 `access_token`、生成小程序码、发送订阅消息、校验登录凭证等。`AppID` 可以出现在前端项目配置里，但 `AppSecret` 绝对不能写到小程序前端代码里，凡是需要调用微信服务端接口的能力，都应该由后端服务完成。

第三，企业/多人合作项目一定要先配置成员权限。管理员需要在小程序后台把开发者加入项目成员，并分配开发、体验、上传等权限。否则可能无法预览、无法上传、无法查看版本。

第四，服务类目要尽早确认。普通展示类、工具类小程序相对简单，但如果涉及教育、医疗、金融、政务、出行、直播、支付等场景，可能需要资质。审核时平台会检查实际功能是否匹配服务类目，类目不匹配是非常典型的打回原因。

## 三、工具安装与项目创建

使用 `uni-app` 开发微信小程序，通常需要两个工具：

- `HBuilderX`：创建和编译 `uni-app` 项目。
- `微信开发者工具`：预览、调试、上传微信小程序代码。

在 `HBuilderX` 中新建项目：

```text
文件 -> 新建 -> 项目 -> uni-app
```

模板可以先选择默认模板。Vue 版本根据团队/个人偏好技术栈选择即可。如果只是普通接口型小程序，`uniCloud` 可以先不启用，后端服务由团队已有服务提供。

创建好项目后，进入 `manifest.json`，找到微信小程序配置，填入前面获取到的 `AppID`。然后运行：

```text
运行 -> 运行到小程序模拟器 -> 微信开发者工具
```

第一次运行时，如果 `HBuilderX` 提示找不到微信开发者工具，需要手动配置安装路径。微信开发者工具里还要打开服务端口：

```text
微信开发者工具 -> 设置 -> 安全设置 -> 服务端口
```

这个服务端口用于让 `HBuilderX` 调起微信开发者工具。如果没开启，经常会出现编译完成但开发者工具没反应、模拟器无法自动打开的问题。

也可以直接在 微信开发者工具 打开项目进行预览。

项目跑起来后，可以点击“预览”，用微信扫码在真机上跑一遍。很多问题只有真机才会暴露，比如授权弹窗、网络请求、机型适配、证书校验和微信客户端能力差异。

## 四、基础配置：manifest.json 和 pages.json

`uni-app` 项目里，和小程序上线最相关的两个配置文件是 `manifest.json` 和 `pages.json`。

`manifest.json` 负责应用和平台配置。开发微信小程序时，重点看微信小程序配置区域：

- `AppID` 是否填写正确。
- 是否开启上传时代码压缩。
- 是否按项目需要配置位置接口、消息推送等平台能力。
- 是否存在错误的调试配置被带到正式构建中。

```text
HBuilderX -> 运行 -> 运行到终端 -> 运行时是否压缩代码
```

`pages.json` 负责页面路由、窗口样式和 `tabBar`。一个简化版配置如下：

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "enablePullDownRefresh": false
      }
    },
    {
      "path": "pages/detail/index",
      "style": {
        "navigationBarTitleText": "详情"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "业务小程序",
    "navigationBarBackgroundColor": "#ffffff",
    "backgroundColor": "#f8f8f8"
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#2979ff",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "static/tab/home.png",
        "selectedIconPath": "static/tab/home-active.png",
        "text": "首页"
      }
    ]
  }
}
```

这里有一个坑是 `tabBar` 页面必须在主包里。后面做分包时，如果把 `tabBar` 页面放进分包，会带来启动和跳转问题。

## 五、接口联调：环境隔离要提前做

小程序通常至少有三套环境：

- 开发版：开发调试使用。
- 体验版：测试、产品、业务验收使用。
- 正式版：线上用户使用。

微信小程序可以通过 `wx.getAccountInfoSync().miniProgram.envVersion` 获取当前环境。基于这个能力，可以封装统一的环境配置：

```js
const env = wx.getAccountInfoSync().miniProgram.envVersion

const baseURLMap = {
  develop: 'https://dev-api.example.com',
  trial: 'https://trial-api.example.com',
  release: 'https://api.example.com'
}

export default {
  baseURL: baseURLMap[env] || baseURLMap.release
}
```

再封装请求工具：

```js
import config from './config.js'

function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: config.baseURL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: options.timeout || 15000,
      header: {
        Authorization: uni.getStorageSync('token') || ''
      },
      success(res) {
        const data = res.data

        if (res.statusCode < 200 || res.statusCode >= 300) {
          uni.showToast({
            title: '服务异常，请稍后重试',
            icon: 'none'
          })
          reject(res)
          return
        }

        if (data.code && data.code !== 200) {
          uni.showToast({
            title: data.message || '请求失败',
            icon: 'none'
          })
        }

        resolve(data)
      },
      fail(err) {
        uni.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export default request
```

注意一个细节：`uni.request` 或 `wx.request` 只要收到了服务器响应，就会进入 `success` 回调，即使 HTTP 状态码是 `500`。所以不能只在 `fail` 里处理错误，业务代码必须判断 `statusCode` 和后端业务码。

业务接口可以按模块拆分：

```js
import request from '@/common/request.js'

export function getAssetList(params) {
  return request({
    url: '/asset/list',
    method: 'GET',
    data: params
  })
}
```

## 六、后端部署与合法域名：上线最常见的坑

小程序正式环境请求失败，第一反应应该检查服务器合法域名。

配置入口：

```text
微信公众平台 -> 开发 -> 开发设置 -> 服务器域名
```

微信小程序只允许和后台配置过的域名通信，涉及普通 HTTPS 请求、文件上传、文件下载和 WebSocket。官方规则里有几个重点：

- `wx.request`、`wx.uploadFile`、`wx.downloadFile` 必须使用 `https`。
- `wx.connectSocket` 必须使用 `wss`。
- 不能配置 `localhost`。
- 不能使用普通 IP 地址作为服务器域名。
- 域名必须经过 ICP 备案。
- 不支持用父域名覆盖所有子域名，要用哪个子域名就配哪个。
- 配置端口后，请求 URL 必须严格匹配端口。
- 没配置端口时，请求 URL 里也不要显式带 `:443`。
- `api.weixin.qq.com` 不能配置为服务器域名，微信服务端接口要由后端调用。

举个最容易忽略的例子。后台配置的是：

```text
https://api.example.com
```

那么请求下面这个地址是合理的：

```text
https://api.example.com/user/info
```

但如果代码里写成：

```text
https://api.example.com:443/user/info
```

就可能因为端口不一致导致请求失败。

微信开发者工具里有一个选项：

```text
不校验合法域名、web-view 域名、TLS 版本以及 HTTPS 证书
```

这个选项只能临时用于本地调试。提测和提审前一定要关闭它，再用真机体验版测试。很多“开发版能请求，体验版和正式版不能请求”的问题，就是因为开发阶段一直跳过了域名校验。

## 七、HTTPS 证书和 TLS：不是浏览器能打开就一定能用

合法域名配置对了，仍然可能请求失败。下一步要查 HTTPS 证书。

小程序会校验服务器 HTTPS 证书。重点检查：

- 证书是否过期。
- 证书绑定域名是否和请求域名一致。
- 证书链是否完整。
- 证书是否被系统信任。
- 是否使用了自签名证书。
- TLS 是否支持 1.2 及以上版本。

这个问题经常表现为：开发者工具正常，iOS 真机失败；浏览器正常，小程序失败；打开调试模式正常，关闭调试模式失败。

遇到这种现象，先检查合法域名，再检查证书链和 TLS 配置。

## 八、UI 框架接入与包体积控制

`uView` 是 `uni-app` 项目里常见的 UI 组件库。接入流程通常是：插件市场导入项目，安装 Sass 依赖，再在入口和样式文件里引入。

示例配置：

```bash
npm i sass -D
npm i sass-loader -D
```

```js
import Vue from 'vue'
import App from './App'
import uView from '@/uni_modules/uview-ui'

Vue.use(uView)
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  ...App
})

app.$mount()
```

```scss
@import '@/uni_modules/uview-ui/theme.scss';
```

```vue
<style lang="scss">
@import '@/uni_modules/uview-ui/index.scss';
</style>
```

组件库能提升效率，但也会增加包体积。上线前建议在微信开发者工具里做代码包分析，重点处理：

- 未压缩的大图片。
- 没有使用但被打进包里的静态资源。
- 低频页面没有分包。
- 大型组件、图表、富文本编辑器被放入主包。
- 调试文件、mock 数据、测试图片没有清理。

小程序单个代码包的体积上限为 2M，必要的时候进行包压缩处理或者分包。

## 九、隐私保护指引：提审前要对齐实际能力

现在小程序只要涉及处理用户个人信息，就需要完善用户隐私保护指引。比如获取手机号、位置、相册、摄像头、收货地址、用户信息等，都可能触发隐私相关要求。

常见配置入口有两个：

用户正在用的版本：

```text
账号设置 -> 服务内容声明 -> 用户隐私保护指引
```

以及提交审核时：

```text
管理 -> 版本管理 -> 提交代码审核 -> 信息填写页面
```

提审时会默认带过来现网版本的隐私协议，可以直接使用。值得注意的是：如果提审版本增加的功能涉及到可能触发隐私相关要求的功能，就需要同步更新提审版本的隐私协议。

所以在提审前建议逐项检查：

- 是否调用位置能力。
- 是否获取手机号。
- 是否使用相册、摄像头、录音能力。
- 是否读取或提交用户地址。
- 是否使用第三方插件，插件是否也涉及隐私说明。
- 隐私协议里是否写清楚信息用途。


## 十、上传、审核与发布

开发完成后，从微信开发者工具里完成预览和上传。

典型流程：

```text
微信开发者工具真机预览
微信开发者工具上传代码
微信公众平台查看开发版本
提交审核
审核通过后发布
正式版回归验证
```

上传时建议填写清晰的版本号和备注：

```text
1.0.0 首次上线
1.0.1 修复登录失败
1.1.0 新增资产详情模块
```

提交审核时，建议在备注里写清楚核心路径，并提供可用测试账号：

```text
测试账号：test@example.com
测试密码：Example123
核心路径：首页 -> 登录 -> 资产列表 -> 资产详情 -> 提交表单
说明：如需查看某页面，请先使用测试账号登录。
```

如果某些功能需要特定角色、特定数据或特定地区才能看到，也要说明。审核人员打不开核心功能时，很容易判定功能不可用或内容不完整。

审核通过后还需要手动发布。发布完成不代表结束，必须马上做正式版回归：

- 搜索小程序能否打开。
- 首页是否正常加载。
- 登录是否正常。
- 正式环境接口是否正常。
- 表单提交是否正常。
- 权限弹窗是否符合预期。
- 分享路径、二维码路径是否正确。
- 老用户是否有缓存兼容问题。

## 十一、真实高频踩坑复盘

### 1. 开发版能请求，体验版请求失败

现象：开发者工具里接口正常，体验版或正式版接口全部失败。

原因：开发者工具开启了“不校验合法域名”，但小程序后台没有配置服务器合法域名，或者配置的域名、端口、协议和实际请求不一致。

解决方式：关闭跳过校验选项，配置 `https` 合法域名，确认请求地址和后台配置完全一致，再用真机体验版验证。

### 2. iOS 请求失败，Android 正常

现象：同一个接口，部分 Android 手机正常，iPhone 请求失败。

原因：HTTPS 证书链不完整、证书不被系统信任，或 TLS 配置不符合要求。

解决方式：检查证书有效期、证书链、域名匹配和 TLS 版本，避免使用自签名证书。

### 3. 提审时提示隐私协议不完整

现象：提交审核时被拦截，提示需要完善用户隐私保护指引。

原因：代码调用了隐私相关接口，但提审版本隐私协议没有声明对应信息类型和用途。

解决方式：在提交审核流程里的隐私协议入口补充说明，并确保声明内容和实际调用能力一致。

### 4. 审核打回说功能不可用

现象：自己测试都正常，但审核结果提示页面打不开或功能不可用。

原因：没有提供测试账号、测试账号权限不足、审核人员不知道入口路径，或测试环境数据为空。

解决方式：提交审核时提供账号、密码、核心路径和必要说明。需要角色权限的功能，要提前准备好可验证数据。

### 5. 上传失败或包体积过大

现象：微信开发者工具上传时报包体积问题，或主包过大影响启动。

原因：图片、组件库、大型业务模块都被打进主包。

解决方式：压缩静态资源，删除无用文件，把低频页面拆到分包，避免把大型资源放进主包。

### 6. 新增页面真机跳转失败

现象：本地代码里写了页面，但真机跳转时报找不到页面。

原因：新增页面没有配置到 `pages.json`，或路径大小写不一致。

解决方式：新增页面时同步更新 `pages.json`，并检查路径和文件夹大小写。

### 7. 后端直接在小程序里调用微信服务端接口

现象：想在小程序里直接请求 `api.weixin.qq.com`，结果配置域名失败或调用失败。

原因：微信服务端接口不应直接由小程序前端调用，`AppSecret` 也不能暴露在前端。

解决方式：由后端保存 `AppSecret`，后端获取 `access_token` 并调用微信服务端 API，小程序只请求自己的业务后端。

### 8. 服务类目不匹配被打回

现象：功能开发完成，但审核提示服务类目不符合。

原因：实际业务能力和后台选择的服务类目不一致，或缺少对应资质。

解决方式：开发前确认服务类目和资质要求，特殊行业提前准备材料。

## 十二、上线前 checklist

提审前可以按这份清单逐项检查：

- 小程序 `AppID` 是否正确。
- 开发者、体验者、上传人员权限是否配置。
- 服务类目是否和实际功能一致。
- 特殊接口能力是否已申请。
- `manifest.json` 微信小程序配置是否正确。
- `pages.json` 页面、首页、tabBar 是否正确。
- 开发版、体验版、正式版接口环境是否隔离。
- 正式接口是否使用 HTTPS。
- 服务器合法域名是否配置。
- 域名是否备案。
- HTTPS 证书链和 TLS 是否正常。
- 是否关闭开发者工具的跳过域名校验后测试。
- 隐私保护指引是否覆盖实际调用能力。
- 是否提供审核测试账号和核心路径说明。
- 主包体积是否合理，是否需要分包。
- 体验版是否完成真机回归。
- 审核通过后是否完成正式版回归。

## 参考资料

- [微信开放文档：开始](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/getstart.html)
- [微信开放文档：网络](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)
- [微信开放文档：用户隐私保护指引填写说明](https://developers.weixin.qq.com/miniprogram/dev/framework/user-privacy/)
- [微信开放文档：使用分包](https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/basic.html)
- [原始参考文章：从零开始 uniapp 微信小程序项目到发布](https://juejin.cn/post/7248835844659839033)
