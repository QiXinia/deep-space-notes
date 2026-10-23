# 深空手记 · Deep Space Notes

一个以「银河—太阳系—地球—学习档案」为主线的沉浸式个人博客。使用 React、TypeScript、Vite 与 Three.js，以同一个场景、同一台相机完成连续滚动航行。

## 体验与功能

- 五段一镜到底航程：银河系、太阳系、土星飞掠、地球近景、学习档案
- 八大行星与太阳真实纹理，地球云层／夜光／法线细节、月球、土星环和大气边缘
- 程序化银河旋臂、星际云气、背景星野与电影级辉光
- 章节导航可直接抵达对应镜头，桌面与手机使用不同构图
- 文章分类筛选、关键词搜索与空状态
- 完整文章阅读弹层、上一篇／下一篇切换
- 桌面导航与移动端菜单，键盘可操作并支持 Escape 关闭
- 375–430px 手机与桌面响应式布局
- 支持 `prefers-reduced-motion`；WebGL 不可用时保留静态背景

## 本地运行

```bash
npm install
npm run assets # 首次运行下载本地纹理；已有纹理会自动跳过
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## 修改内容

- 文章：`src/data/articles.ts`
- 连续镜头与页面叙事：`src/components/Hero.tsx`
- WebGL 生命周期与后处理：`src/components/CosmicScene.tsx`
- 银河与星野：`src/scene/createGalaxy.ts`
- 太阳系与行星细节：`src/scene/createSolarSystem.ts`
- 连续相机路径：`src/scene/cameraPath.ts`
- 关于与页脚：`src/components/About.tsx`
- 页面及响应式样式：`src/App.css`

文章保存在本地数据中，属于纯静态站点，不需要数据库或后端。行星大小和轨道距离经过艺术化压缩，并非科学等比例星图。

## 结构

```text
src/
├── components/       # 3D 场景、航程、导航、文章、搜索、弹层
├── scene/            # 银河、太阳系与连续相机路径
├── data/             # 博客文章数据
├── hooks/            # 减少动态效果偏好
├── types/            # TypeScript 类型
├── App.tsx           # 页面组合与全局交互状态
├── App.css           # 组件与响应式样式
└── index.css         # 设计令牌与全局样式
public/textures/      # 本地行星与太空纹理
```

## 性能与可访问性

桌面端使用约 68,000 个银河星点与受控辉光，移动端减少粒子数量、像素比并关闭后处理。离屏或页面隐藏时停止 GPU 绘制；相机缓动按真实时间计算，不依赖帧率。文字与操作保留在语义化 DOM 中，装饰性 Canvas 不拦截指针。所有可见操作均有实际目标，触控区域不小于 44px。

字体为 Manrope、Cormorant Garamond，通过 Fontsource 本地打包；中文使用系统宋体／黑体字体栈。第三方素材来源与授权见 `CREDITS.md`。
