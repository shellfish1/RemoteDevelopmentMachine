import {CfnKeyPair, CfnKeyPairProps} from "aws-cdk-lib/aws-ec2";
import {v4 as uuidv4} from 'uuid';
import {Construct} from "constructs";


abstract class AbstractEC2KeyPairFactory {
    abstract createKeyPair(): CfnKeyPair
}

interface EC2KeyPairProps {
    stage: string,
    region: string
    prefix: string
}

/**
 * Factory class to create a Key pair for SSH to an EC2 host
 */
export class EC2KeyPairFactory extends AbstractEC2KeyPairFactory {
    private prefix: string;
    private scope: Construct;
    constructor(props : EC2KeyPairProps, scope: Construct) {
        super();
        this.prefix = `${props.stage}-${props.region}-${props.prefix}`
        this.scope = scope
    }
    createKeyPair(): CfnKeyPair{
        const key_name_id = `${this.prefix}-${uuidv4().substring(0, 8)}`
        const props : CfnKeyPairProps = {
            keyName: key_name_id,
            keyFormat: 'pem',
            keyType: 'rsa',
        };
        return new CfnKeyPair(this.scope, key_name_id, props)
    }
}