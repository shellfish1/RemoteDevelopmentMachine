import {Construct} from 'constructs';
import {Stack, StackProps} from "aws-cdk-lib";
import {EC2KeyPairFactory} from "../factories/EC2KeyPairFactory"
import {
  BlockDevice,
  BlockDeviceVolume, CfnEIP, CfnEIPAssociation,
  CfnKeyPair,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  MachineImage, Peer, Port,
  SecurityGroup, SubnetType, UserData,
  Vpc
} from "aws-cdk-lib/aws-ec2";

export interface DevelopmentMachineProps extends StackProps {
  stage: string;
  username: string;
  machine_name: string;
}

export class DevelopmentMachineEC2Stack extends Stack {
  private id: string;
  private keyPairFactory: EC2KeyPairFactory;
  constructor(scope: Construct, id: string, props: DevelopmentMachineProps) {
    super(scope, id, props);
    this.id = `${props.stage}-${props.env?.region!!}-${props.env?.account!!}-ec2-${props.machine_name}`
    this.keyPairFactory = new EC2KeyPairFactory({
      stage: props.stage,
      region: props.env?.region!!,
      prefix: `${props.env?.account!!}-ec2-${props.machine_name}`,
    },this)

    const keyPair: CfnKeyPair = this.keyPairFactory.createKeyPair()
    const vpc: Vpc = new Vpc(this, `${this.id}-vpc`, {})
    const securityGroup: SecurityGroup = new SecurityGroup( this, `${this.id}-securityGroup`, {
      securityGroupName : `${this.id}-securityGroup`,
      vpc: vpc,
      allowAllOutbound: true
    } )
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'Allow access to everyone');
    const ebsVolume: BlockDevice = {
      deviceName: '/dev/sdf',
      volume: BlockDeviceVolume.ebs(50),
      mappingEnabled: true
    }
    const ec2Machine: Instance = new Instance(this, this.id, {
      machineImage: MachineImage.latestAmazonLinux2(),
      availabilityZone: `${props.env?.region!!}a`,
      vpc: vpc,
      securityGroup: securityGroup,
      instanceType: InstanceType.of( InstanceClass.T2, InstanceSize.MICRO ),
      keyName: keyPair.keyName,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC
      },
      associatePublicIpAddress: true,
      blockDevices: [ebsVolume]
    })
    const eip: CfnEIP = new CfnEIP(this, `${this.id}-eip`)
    new CfnEIPAssociation(this, `${this.id}-eip-association`, {
      eip: eip.ref,
      instanceId: ec2Machine.instanceId,
    });
  }
}
