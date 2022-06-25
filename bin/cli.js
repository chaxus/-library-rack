#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const figlet = require('figlet')

program
    // 定义命令和参数
    .command('init <app-name>')
    // 定义上述命令的藐视
    .description('create a new project')
    // 定义选项-f和其藐视
    .option('-f', '--force', 'overwrite target directory if it exist')
    // 定义行为
    .action((name, option) => {
        require('../lib/create')(name, option)
    })
program
    .version(`v${require('../package.json').version}`)
    // 修改帮助信息的首行提示
    .usage('<command> [option]')

// 配置 config 命令
program
    .command('config [value]')
    .description('inspect and modify the config')
    .option('-g, --get <path>', 'get value from option')
    .option('-s, --set <path> <value>')
    .option('-d, --delete <path>', 'delete option from config')
    .action((value, options) => {
        console.log(value, options)
    })

// 配置 ui 命令
program
    .command('ui')
    .description('start add open roc-cli ui')
    .option('-p, --port <port>', 'Port used for the UI Server')
    .action((option) => {
        console.log(option)
    })

program
    // 监听 --help 执行
    .on('--help', () => {
        // 新增说明信息
        console.log(`\r\nRun ${chalk.cyan(`rack <command> --help`)} for detailed usage of given command\r\n`)
    })

program
    .on('--help', () => {
        // 使用 figlet 绘制 Logo
        console.log('\r\n' + figlet.textSync('ran', {
            font: 'Ghost',
            horizontalLayout: 'default',
            verticalLayout: 'default',
            width: 80,
            whitespaceBreak: true
        }));
        // 新增说明信息
        console.log(`\r\nRun ${chalk.cyan(`roc <command> --help`)} show details\r\n`)
    })
// 解析用户执行命令的传入参数
program.parse(process.argv);