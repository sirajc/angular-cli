import * as path from 'path';
import * as chalk from 'chalk';
import * as Task from 'ember-cli/lib/models/task';
import * as webpack from 'webpack';
import * as WebpackDevServer from 'webpack-dev-server';
import * as ProgressPlugin from 'webpack/lib/ProgressPlugin';
import { webpackDevServerOutputOptions } from '../models/';
import { NgCliWebpackConfig } from '../models/webpack-config';
import { ServeTaskOptions } from '../commands/serve';
import { CliConfig } from '../models/config';

module.exports = Task.extend({
  run: function(commandOptions: ServeTaskOptions) {
    
    let lastHash = null;
    let webpackCompiler: any;

    var config: NgCliWebpackConfig = new NgCliWebpackConfig(this.project, commandOptions.environment).config;
    // This allows for live reload of page when changes are made to repo.
    // https://webpack.github.io/docs/webpack-dev-server.html#inline-mode
    config.entry.main.unshift(`webpack-dev-server/client?http://localhost:${commandOptions.port}/`);
    webpackCompiler = webpack(config);

    webpackCompiler.apply(new ProgressPlugin({
      profile: true,
      colors: true
    }));

    const webpackDevServerConfiguration: IWebpackDevServerConfigurationOptions = {
      contentBase: path.resolve(this.project.root, `./${CliConfig.fromProject().defaults.sourceDir}`),
      historyApiFallback: true,
      stats: webpackDevServerOutputOptions,
      inline: true,
      hot: true
    };

    const serveMessage:string = chalk.green(`\n*\n*\n NG Live Development Server is running on http://localhost:${commandOptions.port}.\n*\n*`);
    const server = new WebpackDevServer(webpackCompiler, webpackDevServerConfiguration);

    return new Promise((resolve, reject) => {
      server.listen(commandOptions.port, 'localhost', function(err, stats) {
        if(err) {
          lastHash = null;
          console.error(err.stack || err);
          if(err.details) console.error(err.details);
            reject(err.details);
        }

        if(stats && stats.hash && stats.hash !== lastHash) {
          lastHash = stats.hash;
          process.stdout.write(stats.toString(webpackOutputOptions) + '\n' + serveMessage + '\n');
        }

        process.stdout.write(serveMessage);
      });
    })
  }
});



