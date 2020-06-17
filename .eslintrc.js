module.exports = {

  //此项是用来告诉eslint找当前配置文件不能往父级查找
  root: true,

  //此项是用来指定eslint解析器的，解析器必须符合规则，babel-eslint解析器是对babel解析器的包装使其与ESLint解析
  parser: 'babel-eslint',

  //此项是用来指定javaScript语言类型和风格，sourceType用来指定js导入的方式，默认是script，此处设置为module，指某块导入方式
  parserOptions: {
    // 设置 script(默认) 或 module，如果代码是在ECMASCRIPT中的模块
    sourceType: 'module',
    "ecmaVersion": 6,
  },

  // 此项指定环境的全局变量，下面的配置指定为浏览器环境
  env: {
    "browser": true,
    "node": true,
    "commonjs": true,
    "es6": true,
    "amd": true
  },
  /* 
   下面这些rules是用来设置从插件来的规范代码的规则，使用必须去掉前缀eslint-plugin-
    主要有如下的设置规则，可以设置字符串也可以设置数字，两者效果一致
    "off" -> 0 关闭规则
    "warn" -> 1 开启警告规则
    "error" -> 2 开启错误规则
  */
  rules: {
    // 不需要
    "space-before-function-paren": 0,  // 函数定义时括号前面要不要有空格
    "eol-last": 0,  // 文件以单一的换行符结束
    "no-extra-semi": 0, // 可以多余的冒号
    "semi": 0,  // 语句可以不需要分号结尾
    "eqeqeq": 0, // 必须使用全等
    "one-var": 0, // 连续声明
    "no-undef": 0, // 可以 有未定义的变量
    // 错误
    "comma-dangle": [2, "never"], // 对象字面量项尾不能有逗号
    "no-debugger": 2, // 禁止使用debugger
  }
}
