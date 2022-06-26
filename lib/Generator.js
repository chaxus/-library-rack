const path = require("path");
const chalk = require("chalk");
const { getRepoList } = require("./http");
// ora处理loading特效
const ora = require("ora");
const fs = require("fs");
// 用户选择模版逻辑
const inquirer = require("inquirer");
const handlebars = require("handlebars");
// 从git上下载的库
// const downloadGitRepo = require('download-git-repo') // 不支持 Promise
// 出现fetch 128错误，修改成node子进程直接下载
const child_process = require("child_process");
const { spawn } = child_process;

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result;
  } catch (error) {
    // 状态为修改为失败
    spinner.fail("Request failed, refetch ...");
    console.log("失败", error.message);
  }
}
// 新建Generator处理项目创建逻辑
class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    this.spinner = null;
    this.packagejson = {
      name: name || "",
      license: "MIT",
      author: "",
      repository: "",
    };
  }
  renderPackage() {
    // 判断是否有package.json, 要把输入的数据回填到模板中
    const packpath = path.join(this.targetDir, "package.json");
    if (fs.existsSync(packpath)) {
      const content = fs.readFileSync(packpath).toString();
      // handlebars 模板处理引擎
      const template = handlebars.compile(content);
      const result = template(this.packagejson);
      fs.writeFileSync(packpath, result);
    }
  }
  spawndown(repo, name) {
    const downspawn = spawn("git", [
      "clone",
      "-b",
      "main",
      `https://gitlab.com/template-cli/${repo}.git`,
      name,
    ]);
    // const spinner = ora('download template');
    // spinner.start();
    return new Promise((resolve, reject) => {
      downspawn.stdout.on("data", function (data) {
        console.log("downspawn stdout:", `${data}`);
      });
    //   downspawn.stderr.on("data", (data)=>{
    //     console.log("download stderr:", `${data}`);
    //     reject(`${data}`);
    //   });
      downspawn.on("close", (data) => {
        // console.log("downspawn close", `${data}`);
        // spinner.succeed();
        resolve(`${data}`);
      });
      downspawn.on("error", function (data) {
        console.log("download error:", `${data}`);
        // spinner.fail("Request failed, refetch ...");
        reject(`${data}`);
      });
    });
  }
  // 下载远程模板
  // 1）拼接下载地址
  // 2）调用下载方法
  async download(repo) {
    // 1）拼接下载地址
    const { author = "" } = await inquirer.prompt({
      name: "author",
      type: "input",
      message: "Please input author",
    });
    this.packagejson.author = author;
    return wrapLoading(this.spawndown,'download template',repo, this.name)
  }
  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己新下载的模板名称
  // 3）return 用户选择的名称
  async getRepo() {
    // 1）从远程拉取模板数据
    const repoList = await wrapLoading(getRepoList, "fetch template");
    if (!repoList) return;

    // 过滤我们需要的模板名称
    const repos = repoList.map((item) => item.name);

    // 2）用户选择自己新下载的模板名称
    const { repo } = await inquirer.prompt({
      name: "repo",
      type: "list",
      choices: repos,
      message: "Please choose a template to create project",
    });

    // 3）return 用户选择的名称
    return repo;
  }

  // 核心创建逻辑
  // 1）获取模板名称
  // 2）获取 tag 名称
  // 3）下载模板到模板目录
  async create() {
    try {
      // 1）获取模板名称
      const repo = await this.getRepo();
      await this.download(repo)
      this.renderPackage()
      // 4) 成功后的提示
      console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`);
      console.log(`\r\n  cd ${chalk.cyan(this.name)}`);
      console.log("  npm run build\r\n");
    } catch (error) {
      console.log(`${error.message}`);
    }
  }
}

module.exports = Generator;
