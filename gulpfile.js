// 实现这个项目的构建任务
const { src, dest, parallel, series, watch } = require("gulp")
const path = require("path")
const exec = require('child_process').exec;

const del = require('del')
const browserSync = require("browser-sync")

const loadPlugins = require("gulp-load-plugins")
const { stream, use } = require("browser-sync");
const { copyFile } = require("fs");

const plugins = loadPlugins()
const bs = browserSync.create()

const cwd = process.cwd()
const argv = require('minimist')(process.argv.slice(2));


let config = {
    //default config
    build: {
        src: 'src',
        dist: 'dist',
        temp: 'temp',
        public: 'public',
        paths: {
            styles: 'assets/styles/*.scss',
            scripts: 'assets/scripts/*.js',
            pages: '*.html',
            images: 'assets/images/**',
            fonts: 'assets/fonts/**'
        }
    }
}

try {
    const loadConfig = require(`${cwd}/pages.config.js`)
    config = Object.assign({}, config, loadConfig)
} catch (e) {
    console.log(e)
}

const clean = () => {
    return del([config.build.dist, config.build.temp])
}

const style = () => {
    return src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.sass({
            outputStyle: 'expanded'
        }))
        .pipe(dest(config.build.temp))
        .pipe(bs.reload({ stream: true }))
}

const script = () => {
    return src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
        .pipe(dest(config.build.temp))
        .pipe(bs.reload({ stream: true }))
}

const page = () => {
    return src(config.build.paths.pages, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.swig({ data: config.data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
        .pipe(dest(config.build.temp))
        .pipe(bs.reload({ stream: true }))
}

const image = () => {
    return src(config.build.paths.images, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.imagemin())
        .pipe(dest(config.build.dist))
}

const font = () => {
    return src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.imagemin())
        .pipe(dest(config.build.dist))
}

const extra = () => {
    return src('**', { base: config.build.public, cwd: config.build.public })
        .pipe(dest(path.join(config.build.dist, config.build.public)))
}

const develop = () => {
    watch(config.build.paths.styles, { cwd: config.build.src }, style)
    watch(config.build.paths.scripts, { cwd: config.build.src }, script)
    watch(config.build.paths.pages, { cwd: config.build.src }, page)

    watch([
        config.build.paths.images,
        config.build.paths.fonts],
        { cwd: config.build.src },
        bs.reload)

    watch('**',
        { cwd: config.build.public },
        bs.reload)

    bs.init(
        {
            notify: false,
            port: 2080,
            open: false,
            // files: 'dist/**',
            server: {
                baseDir: [config.build.temp, config.build.dist, config.build.public],
                routes: {
                    '/node_modules': 'node_modules'
                }
            }
        }
    )
}
const useref = () => {
    return src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })
        .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] }))
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
        })))
        .pipe(dest(config.build.dist))
}



const add = done => {
    console.log(argv.production)
    exec('git add .', function (err, stdout, stderr) {
        if (err) throw err
        process.stderr.write(stdout);
        done()
    });
}
const commit = done => {
    let commitdefault = '打包提交'
    let commitcon
    if (!argv.production) {
        commitcon = commitdefault
    } else {
        commitcon = argv.production
    }
    exec('git commit -m ' + `"${commitcon}"`, function (err, stdout, stderr) {
        if (err) throw err
        process.stderr.write(stdout);
        done()
    });
};

const push = done => {
    exec('git push', function (err, stdout, stderr) {
        if (err) throw err
        process.stderr.write(stdout);
        done()
    });
};




const eslint = () => {
    return src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.eslint())
        // format（）将lint结果输出到控制台。
        // 或者使用eslint.formatEach（）（参见文档）。
        .pipe(plugins.eslint.format())
        // eslint.results()输出结果
        .pipe(plugins.eslint.results(results => {
            console.log(`Total Results: ${results.length}`);
            console.log(`Total Warnings: ${results.warningCount}`);
            console.log(`Total Errors: ${results.errorCount}`);
        }));
};
const scsslint = () => {
    return src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.sassLint());
};

const compile = parallel(style, script, page)

const build = series(
    clean,
    parallel(
        series(compile, useref),
        extra,
        image,
        font
    )
)
const start = series(build, develop)

const serve = series(compile, develop)
const lint = series(eslint, scsslint)
const deploy = series(add, commit, push)
module.exports = {
    compile,
    build,
    clean,
    serve,
    lint,
    start,
    deploy
}