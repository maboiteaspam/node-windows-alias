#!/usr/bin/env node

var pkg = require('./package.json');
var program = require('commander');
var exec = require('child_process').exec;
var path = require('path-extra');
var fs = require('fs-extra');
var parser = require('cline-parser');

program.version(pkg.version);

program
  .arguments('[alias] [cmd]')
  .action(function(alias, cmd){
    alias = alias.replace(/[^a-z-_]+/, '');
    var nodeAliasHome = path.join(path.homedir(), 'node-windows-alias');
    var aliasHome = path.join(nodeAliasHome, alias);
    fs.mkdirsSync(nodeAliasHome);
    fs.ensureDirSync(aliasHome);
    fs.emptyDirSync(aliasHome);
    var writePackage = function(){
      var pkg_ = {};
      pkg_.author = 'none';
      pkg_.private = true;
      pkg_.bin = {};
      pkg_.bin[alias] = 'index.js';
      fs.writeFileSync(aliasHome+'/package.json', JSON.stringify(pkg_,null,4));
      cmd = parser(cmd);
      var args = JSON.stringify(cmd.args)
      var launcher = "#!/usr/bin/env node\n\n";
      launcher += "process.argv.shift();process.argv.shift();\n";
      launcher += "require('child_process').spawn('"+cmd.prg+"',"+args+".concat(process.argv),{stdio:'inherit'});\n";
      fs.writeFileSync(aliasHome+'/index.js', launcher);
    };
    writePackage();
    exec('npm init -y',{cwd:aliasHome,stdio:'inherit'}, function(){
      exec('npm i . -g',{cwd:aliasHome,stdio:'inherit'});
    });
  });

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);