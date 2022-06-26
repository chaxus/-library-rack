/*
 * @Author: rzh
 * @Date: 2021-10-10 18:18:02
 * @LastEditors: rzh
 * @LastEditTime: 2021-10-10 20:58:49
 * @Description: Do not edit
 */
const path = require('path')
// fs-extra是对fs的扩展模块，支持promise
const fs = require('fs-extra')
// 命令行交互工具，用来询问用户是否覆盖的问题
const inquirer = require('inquirer')
const Generator = require('./Generator')

module.exports = async function (name, options) {
    // 执行创建命令
    // console.log('>>> create.js', name, options)
    // 当前命令行选择的参数
    const pwd = process.cwd()
    // 需要创建的目录地址
    const targetAir = path.join(pwd, name)
    // 检查目录是否已经存在，
    // force为选项，是否强制创建
    // 1.如果存在，查看用户输入{force:true},移除原来目录，直接创建。如果{force:false}询问用户是否覆盖
    // 2.如果不存在，直接创建
    if (fs.existsSync(targetAir)) {
        // 是否为强制创建
        if (options.force) {
            await fs.remove(targetAir)
        } else {
            // 询问用户是否覆盖
            // 询问用户是否确定要覆盖
            let { action } = await inquirer.prompt([
                {
                    name: 'action',
                    type: 'list',
                    message: 'Target directory already exists Pick an action:',
                    choices: [
                        {
                            name: 'Overwrite',
                            value: 'overwrite'
                        }, {
                            name: 'Cancel',
                            value: false
                        }
                    ]
                }
            ])
            if (!action) {
                return;
              } else if (action === 'overwrite') {
                // 移除已存在的目录
                console.log('\r\nRemoving...')
                await fs.remove(targetAir)
              }
        }
    }
    // 创建项目
  const generator = new Generator(name, targetAir);
  // 开始创建项目
  generator.create()
}