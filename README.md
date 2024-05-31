# vuecommon

> \"vue公共组件\"

## 发布流程

1.提交代码到git仓库，保持项目是clean状态
```shell
# 提交代码
git add .
git commit
git push
```

2、更新版本号

**不建议手动修改package.json中的版本号，然后再提交commit**
```shell
# 更新小版本号
npm version patch

# 更新预发布版本号并添加beta前缀
npm version prerelease --preid=beta

# 自定义commit信息 %s会自动替换为版本号
npm version patch -m "更新版本号为 %s"
```

一般情况下组件都是修复一些bug，直接执行npm version patch即可更新最后一位版本号，详细情况可以参考npm version的使用

使用npm version patch时，会进行3个操作：
+ 更改package.json中的version（比如将版本信息0.0.1修改为0.0.2 ）
+ 保存修改并提交commit
+ 生成和版本号同名的tag

可以直接执行 `npm run release` 会自动升级package.json中的版本号，生成 Changelog.md,然后打tag



4.同时提交commit和tag到git仓库
```shell
# 实际执行的是git push --follow-tags
npm run postversion
```

4.更新npm包
```
npm run push
```

## 项目结构说明
```
├── README.md
├── build                                                   打包配置
│   └── webpack.config.js
├── index.js                                                入口文件
├── lib                                                     打包产物
│   ├── index.js
│   └── static
│       ├── css
│       └── iconfont.58685fa.svg
├── package-lock.json
├── package.json
├── postcss.config.js
├── src                                                     源码文件
│   ├── assets                                              静态资源
│   │   ├── css
│   │   ├── icon-font
│   │   └── images
│   ├── components                                          组件
│   │   ├── aside-dialog
│   │   ├── backtop
│   │   ├── city
│   │   ├── collapse
│   │   ├── date
│   │   ├── date-range
│   │   ├── descriptions
│   │   ├── drag
│   │   ├── enterEvent
│   │   ├── eventBus
│   │   ├── form
│   │   ├── image-upload
│   │   ├── image-viewer
│   │   ├── input-icon
│   │   ├── keep-alive
│   │   ├── layout
│   │   ├── login
│   │   ├── menu
│   │   ├── navigation-menu
│   │   ├── navigation-tabs
│   │   ├── organization
│   │   ├── organization-options
│   │   ├── record
│   │   ├── result
│   │   ├── steps
│   │   ├── system-menu
│   │   ├── table
│   │   ├── table-el
│   │   ├── tagsNav
│   │   ├── throttle
│   │   ├── tree
│   │   ├── updatePassword
│   │   └── verification
│   ├── directives                                          全局指令
│   │   ├── index.js
│   │   └── src
│   ├── filters                                             全局过滤器
│   │   └── index.js
│   ├── store                                               数据仓库
│   │   ├── filtersData.js
│   │   ├── global.js
│   │   ├── index.js
│   │   └── modules
│   ├── util                                                工具
│   │   ├── baseMethods.js                                  公共方法
│   │   ├── config.js
│   │   ├── eventBus.js
│   │   ├── httpService.js                                  请求封装
│   │   ├── means.js                                        用户中台接口封装
│   │   ├── pending.js
│   │   ├── power.js                                        权限封装
│   │   ├── regexList.js
│   │   ├── resetMessage.js
│   │   ├── rules.js
│   │   └── watermark.js
│   └── vux
│       └── components
└── vux.js
```