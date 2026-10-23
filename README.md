# 深空手记 · Deep Space Notes

一个以星辰大海为主题的个人博客。React + TypeScript + Vite 模块化实现，Three.js 程序化生成 3D 行星、星环、旋涡星系、星野与星云，无外部图片依赖。

## 功能

- 沉浸式 3D 首屏，支持指针视差、滚动景深与减少动态效果偏好
- 文章分类筛选、关键词搜索与空状态
- 完整文章阅读弹层、上一篇／下一篇切换
- 桌面导航与移动端菜单，键盘可操作并支持 Escape 关闭
- 375–430px 手机与桌面响应式布局
- WebGL 不可用时保留静态宇宙背景

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## 修改内容

- 文章：`src/data/articles.ts`
- 文章类型：`src/types/blog.ts`
- 3D 场景：`src/components/CosmicScene.tsx`
- 关于与页脚：`src/components/About.tsx`
- 全局色彩与字体：`src/index.css`
- 页面及组件样式：`src/App.css`

文章当前保存在本地数据中，属于纯静态站点，不需要数据库或后端。替换示例文字即可作为个人博客使用。

## 结构

```text
src/
├── components/       # 3D 场景、导航、文章、搜索、弹层等
├── data/             # 博客文章数据
├── hooks/            # 减少动态效果偏好
├── types/            # TypeScript 类型
├── App.tsx           # 页面组合与全局交互状态
├── App.css           # 组件与响应式样式
└── index.css         # 设计令牌与全局样式
```

## 性能与可访问性

桌面端约 16,000 个星系粒子和 2,400 个背景星点，移动端自动降低粒子数量与像素比；离屏时停止 GPU 绘制。文字与操作保留在语义化 DOM 中，装饰性 Canvas 不拦截指针。所有可见操作均有实际目标，触控区域不小于 44px。

字体：Manrope、Cormorant Garamond（通过 Fontsource 本地打包）；中文使用系统宋体／黑体字体栈。视觉素材均为代码程序化生成。
