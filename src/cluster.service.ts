import { Injectable } from '@nestjs/common';

import { availableParallelism } from 'node:os';
import * as process from 'node:process';
import cluster from 'node:cluster';

const numCPUs = availableParallelism();

console.log(`Number of CPUs: ${numCPUs}`);

@Injectable()
export class ClusterService {
  static clusterize(callback: () => void): void {
    if (cluster.isPrimary) {
      console.log(`Master server started on ${process.pid}`);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
      cluster.on('exit', (worker, code, signal) => {
        console.log(
          `Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`,
        );
        cluster.fork();
      });
    } else {
      console.log(`Cluster server started on ${process.pid}`);
      callback();
    }
  }
}
