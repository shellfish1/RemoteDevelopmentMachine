#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {DevelopmentMachineEC2Stack} from '../lib/stacks/DevelopmentMachineEC2Stack';

const env = process.env.ENV || 'dev';
const region = process.env.REGION || 'us-east-1';

console.log("Creating Stacks for Environment : ", env);
console.log("Creating Stacks for Region : ", region);


const app = new cdk.App();
new DevelopmentMachineEC2Stack(app, 'dev-us-east-1-DevelopmentMachineStack', {
    machine_name: "cs3700",
    stage: "dev",
    username: "shellfish1",
    env: {
        region: 'us-east-1',
        account: '123456789101'
    }
});