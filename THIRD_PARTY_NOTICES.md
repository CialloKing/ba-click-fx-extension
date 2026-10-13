# 第三方代码说明

## ba-click-fx

- 项目：`ba-click-fx`
- 上游仓库：https://github.com/CialloKing/ba-click-fx
- npm 包：https://www.npmjs.com/package/ba-click-fx
- 许可证：MIT
- 作者：CialloKing

本扩展通过 npm 安装核心库，并在构建阶段将其打包到内容脚本中。实际使用的精确版本及完整性哈希记录在 `package-lock.json`。

上游项目说明中还致谢了以下参考实现：

- VanillaNahida/BA-Spark-Cursor
- DoomVoss/BASpark

本仓库不打包上游演示页、文档 GIF 或其他非运行时资源。

## fflate

上游核心在运行时内嵌 fflate，用于同步解码无损压缩的纹理和几何数据。本扩展构建的内容脚本包含这部分代码，以下保留上游 npm 包提供的完整许可证。

- 项目：https://github.com/101arrowz/fflate
- 许可证：MIT

MIT License

Copyright (c) 2026 Arjun Barrett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
