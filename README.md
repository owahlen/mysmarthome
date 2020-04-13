# MySmartHome 
[![Build Status](https://travis-ci.org/owahlen/mysmarthome.svg?branch=master)](https://travis-ci.org/owahlen/mysmarthome)
[![Coverage Status](https://coveralls.io/repos/github/owahlen/mysmarthome/badge.svg?branch=master)](https://coveralls.io/github/owahlen/mysmarthome?branch=master)

## Table of Contents
* [Overview](#overview)
* [Architecture](#architecture)
    * [Alexa Skill](#alexa-skill)
    * [Interfacing with the Raspberry Pi](#interfacing-with-the-raspberry-pi)
    * [Communication flow controlling the TV via voice](#communication-flow-controlling-the-tv-via-voice)
    * [Design Caveats](#design-caveats)
        * [Request/Response over Pub/Sub](#request/response-over-pubsub)
        * [Pub/Sub inside the Lambda](#pubsub-inside-the-lambda)
* [Setup](#setup)
    * [Setup IoT](#setup-iot)
    * [Login with Amazon (LWA)](#login-with-amazon-lwa)
    * [Create the Smart Home Skill](#create-the-smart-home-skill)
    * [Create the Lambda for the Skill](#create-the-lambda-for-the-skill)
    * [Create S3 bucket to store the Lambda sourcecode](#create-s3-bucket-to-store-the-lambda-sourcecode)
    * [Package the sources and upload to S3](#package-the-sources-and-upload-to-s3)
    * [Deploy the Lambda into the AWS cloud](#deploy-the-lambda-into-the-aws-cloud)
    * [Configure the Skill](#configure-the-skill)
    * [Account Linking and Device Discovery](#account-linking-and-device-discovery)
    * [Setup the Raspberry Pi](#setup-the-raspberry-pi)
* [Debugging](#debugging)
    * [Local deployment of the Lambda](#local-deployment-of-the-lambda)
    * [Lambda deployed to the cloud](#lambda-deployed-to-the-cloud)
    * [MQTT](#mqtt)
    * [Node-RED](#node-red)
    * [Alexa](#alexa)

## Overview
This project integrates _Amazon Alexa_ with a _Raspberry Pi_ in order to control home devices.
The device used as an example is a _Gutmann_ cooking hook. Gutmann provides the _TZ 602_ IR remote to control the device.
A [Irdroid USB Infrared Transceiver](https://www.irdroid.com/irdroid-usb-ir-transceiver)
is attached to the Raspberry Pi to mimic the signals of the TS 602.
Adapting the functionality to other devices should be straight forward.

## Architecture

![architecture diagram](http://www.plantuml.com/plantuml/proxy?src=https://raw.github.com/owahlen/mysmarthome/master/images/architecture.puml)

### Alexa Skill
In order to interact with Alexa a _skill_ needs to be created.
There are a variety of Alexa [skill types](https://developer.amazon.com/docs/ask-overviews/understanding-the-different-types-of-skills.html).
The _Smart Home Skill_ has the advantage that it is aware of the typical voice interactions with a smart device.
The [alexa-smarthome](https://github.com/alexa/alexa-smarthome/wiki/Build-a-Working-Smart-Home-Skill-in-15-Minutes) 
project explains the basics how to setup this skill type.
Note that a _Custom Skill_ could have been used, too.
However, this has the disadvantage that the skill name must be mentioned in all the interactions with Alexa.
So instead of _alexa, turn of the cooking hood_ you will have to say _alexa, turn of the cooking hood using my smart home_.

From a programmers model the central component of a skill is a [AWS Lambda](https://aws.amazon.com/lambda) function that gets called by Alexa services.
To simplify the deployment and testing of the Lambda this project uses the [AWS Serverless Application Model (SAM)](https://aws.amazon.com/serverless/sam/).
To leverage the advantages of a typed language the Lambda is written in [TypeScript](https://www.typescriptlang.org/)

### Interfacing with the Raspberry Pi
There is no way that the Alexa device can directly interact with other local devices on the home network.
Instead it transfers voice data to the AWS cloud where it gets processed and required functions are triggered.
This means, that the Raspberry PI must somehow be reachable from the internet which raises security questions.
For example it is considered a bad security practice to forwarding a port from your home router to the Raspberry Pi.
Instead [Amazon IoT core](https://aws.amazon.com/iot-core) will be used to expose a topic through an MQTT-Broker.
The Raspberry Pi actively subscribes as a client to this topic though an encrypted channel.
On the Raspberry Pi [Node-RED](https://nodered.org/) handles the piping of the incoming MQTT messages to the Irdroid device.

### Communication flow controlling the TV via voice
An example flow of events is shown in the following sequence diagram:

![communication flow](http://www.plantuml.com/plantuml/proxy?src=https://raw.github.com/owahlen/mysmarthome/master/images/control-sequence.puml?version=1)

### Design Caveats

#### Request/Response over Pub/Sub
If the smart device would be securely reachable by the Lambda, a conventional _HTTP request/response_ between the two
would be the straight forward solution. Since IoT was used to ensure security and reachability,
the semantics of _request/response_ must be mapped onto a _pub/sub_ system.
As shown in the communication flow, this creates some complexity managing subscribing and publishing
to _request topics_ and to _response topics_, each unique for every Lambda function call.
Note that the functionality is contained in the
[IotTransceiver](https://github.com/owahlen/mysmarthome/blob/master/src/iot/IotTransceiver.ts)
class of this project.

#### Pub/Sub inside the Lambda
Typically a Lambda communicates with _IoT_ through the
[IoT REST API](https://docs.aws.amazon.com/iot/latest/developerguide/http.html).
The [AWS SDK](https://aws.amazon.com/sdk-for-node-js) contains the
[AWS.IoTData](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IotData.html)
class for this purpose.
This API has the advantage that it is simple and fast.
It however does not allow subscriptions to topics.
Thus it is not possible to receive responses back from the TV device.

In order to get feedback from the smart device, the Skill Lambda therefore uses the
[aws-iot-device-sdk](https://docs.aws.amazon.com/iot/latest/developerguide/iot-sdks.html)
to connect to IoT with the
[MQTT over WebSocket protocol](https://docs.aws.amazon.com/iot/latest/developerguide/mqtt-ws.html).
This however means that in case of a
[cold](https://docs.aws.amazon.com/lambda/latest/dg/running-lambda-code.html) Lambda
some time (1-2 seconds) is required to setup the connection between the Lambda and _IoT core_.

## Setup
In order to manage Skills, IoT and to deploy the lambda an
[Amazon developer account](https://developer.amazon.com/login.html) and an 
[AWS account](https://console.aws.amazon.com/console/home) are required.

### Setup IoT
IoT should be setup first, since the endpoint of its message broker must be configured in both the Skill Lambda and the Raspberry Pi, afterwards.
IoT allows physical devices like the Raspberry Pi to communicate via _Pub/Sub_ with an MQTT broker managed by Amazon.
The device is represented by a so called _Thing_ in the AWS cloud.
Certificate files deployed to the device are used to secure the communication with the broker.
The set of certificate files is represented by a _Certificate_ object
and associated with the _Thing_.
Finally a _Certificate_ is associated with one or more _Policies_.
A _Policy_ contains a JSON document that describes which operations or resources
a device can use. The following figure shows the relation between all involved items.

![IoT Entity Relations](http://www.plantuml.com/plantuml/proxy?src=https://raw.github.com/owahlen/mysmarthome/master/images/iot-er.puml)

Setting up IoT involves the following steps:
* In the AWS Console select the _IoT Core_ service.
* In the _AWS IoT_ menu click _Secure_ -> _Policies_ -> _Create_
* Provide _RaspberryPi_ as policy name and click _Advanced mode_
* Copy&paste the contents of this [iot policy document](https://raw.github.com/owahlen/mysmarthome/master/images/iot-policy.json) into the JSON editor
* in the _Resource_ sections of the file adjust the [AWS region](https://docs.aws.amazon.com/general/latest/gr/rande.html) and the [AWS Account ID](https://www.apn-portal.com/knowledgebase/articles/FAQ/Where-Can-I-Find-My-AWS-Account-ID) and click _Create_
* In the _AWS IoT_ menu click _Manage_ -> _Things_ -> _Create_ -> _Create a single thing_
* In the _Add your device to the thing registry_ dialog provide the name _RaspberryPi_ and click _Next_
* In the _Add a certificate for your thing_ dialog click the recommended _One-click certificate creation_
* Download the certificate, the public key and the private key
* Follow the link to download the [root CA for AWS IoT](https://www.amazontrust.com/repository/AmazonRootCA1.pem)
* click _Attach a policy_
* select the previously create policy with the name _RaspberryPi_ and click _Register Thing_
* In the _AWS IoT_ menu click on _Settings_ and note down the name of the _Endpoint_
* As a final step copy the four downloaded certificate files onto the Raspberry Pi.

### Login with Amazon (LWA)
Typically Smart Home hardware vendors operate their own cloud platform.
Their users sign up and register their devices with the platform making them accessible from the internet.
Within the Alexa app the user links his platform account with Alexa and hereby makes it accessible via an Alexa skill that is typically provided by the vendor.

Since there is no vendor cloud platform in this project the _account linking_ required by the _Smart Home Skill_ is done using [Login with Amazon](https://developer.amazon.com/login-with-amazon).
This service acts as an _OAuth 2 provider_ required to perform the account linking.
Log into the [developer console](https://developer.amazon.com/login.html) and under _Login with Amazon_ create a new Security Profile.

Provide the following values for the required fields:

<table>
<tbody>
<tr><td><b>Security Profile Name:</b></td><td>MySmartHome</td></tr>
<tr><td><b>Security Profile Description:</b></td><td>Handles login into MySmartHome</td></tr>
<tr><td><b>Consent Privacy Notice URL:</b></td><td>http://example.com/privacy</td></tr>
<tr><td><b>Consent Logo Image:</b></td><td>&lt;leave as it is&gt;</td></tr>
</tbody>
</table>

After clicking _Save_, make sure you write down the _Client ID_ and the _Client-Secret_. It will be required later.

### Create the Smart Home Skill
1. Log into your developer account on [https://developer.amazon.com/login.html](https://developer.amazon.com/login.html)
2. Go to _Alexa_ > _Alexa Console_ > _Skills_ > _Create Skill_
3. In the dialog provide the name of the skill: _mysmarthome_ and select _Smart Home_ as model
4. In the Smart Home dialog note down the _Skill ID_ and click _Save_

### Create the Lambda for the Skill
* Open the file `template.yml` and insert the _Skill ID_ into the _AlexaSkillKit -> Id_
  entry at the top of the file.
* Open the file `src/iot/IotTransceiverFactory.ts` and change the variable `iotEndpoint` to the
  _Endpoint_ noted down before when setting up IoT 

### Create S3 bucket to store the Lambda sourcecode
Decide for a S3 bucket name to store the sourcecode.
Insert this name as _bucketName_ in the config section of the file _package.json_.
Now create the bucket either in the AWS Console or with the following _aws cli_ command.
Note that the name _mysmarthome-skill_ was chosen in this example.
```
aws s3 mb s3://mysmarthome-skill
```

### Package the sources and upload to S3
Use the following _npm_ command to transfer the Lambda code into the S3 bucket:
```
npm run package
```

### Deploy the Lambda into the AWS cloud
After the sources have been uploaded to S3 the Lambda can be deployed with the command:
```
npm run deploy
```
In the AWS console find the Lambda that has just been created and note down its ARN.

### Configure the Skill
In the skill's configuration tab enter the following values:
* Default endpoint: ARN of the Lambda that was noted down before

Under _Account Linking_ configure the following values:
* Authorization URI = https://www.amazon.com/ap/oa
* Access Token URI: https://api.amazon.com/auth/o2/token
* Your Client ID: LWA Client ID that was noted down before
* Your Secret: your client secret from LWA noted in a previous step
* Scope: _profile:user_id_ (click Add Scope first to add)
* Client Authentication Scheme: HTTP Basic (Recommended)
* Note down the _Alexa Redirect URLs_

Now open the LWA security profile created earlier and visit the Web Settings dialog.
Provide each of the Redirect URL values from your skill in the _Allowed Return URLs_ field.

### Account Linking and Device Discovery
After the _Login with Amazon_ is configured and the _Skill Lambda_ is deployed
the user's account must be linked with the skill and the TV device must be discovered.
The _Alexa_ mobile app can be used for this purpose: 

![account linking and device discovery sequence](http://www.plantuml.com/plantuml/proxy?src=https://raw.github.com/owahlen/mysmarthome/master/images/setup-sequence.puml)

Note that the dotted arrows indicate that the Lambda could use the Raspberry Pi to
discover other devices in the home network.
In this example project the _Discover.Response_ is hard coded into the Lambda.

### Setup the Raspberry Pi
Node-RED needs to be
[installed](https://nodered.org/docs/getting-started/raspberrypi)
on the Raspberry Pi and configured to Autostart on boot.
Node-RED can then be reached with a browser under the IP-address or hostname of the Raspberry Pi
using the URL: `http://<hostname>:1880`

After downloading and importing the required
[flow](https://raw.github.com/owahlen/mysmarthome/master/images/flows.json)
the browser should show this figure:
![Node-RED flow](https://raw.github.com/owahlen/mysmarthome/master/images/Node-RED%20flow.png)

Before deployment, the two MQTT nodes _receive request_ and _publish response_
need to be configured with the downloaded certificate files:
* Double click on the node and edit the _MySmartHome MQTT_ server
* In the _Server_ field enter the _Endpoint_ noted down before when setting up IoT 
* Edit the _TLS-Configuration_ called _AWS-RaspberryPi_
* Provide the path to the certificate, the private key and the root CA and click _Update_

Now the flow can be deployed to the device by pressing the _deploy_ button in the upper right.
The following will happen on the Raspberry Pi:
* The `receive request` node connects to the MQTT broker and subscribes on a
  _request_ topic for incoming request messages. The message is a string encoded JSON array
  of key names to be pressed on the TV. E.g. `"[\"VolumeUp\",\"VolumeUp\"]"`.
* In the `to object` node each incoming message is converted into a JavaScript object
* The `split keys` node now splits up the array and generates a message for each element
* The `key json` node transforms the message into a payload that can be posted to the TV. E.g. `{"key":"VolumeUp"}`
* Since the API of the Philips TV cannot handle bursts of requests it needs to be rate limited by the `rate limit` node
* The `post key` node posts the payload to the REST-API of the TV which sets a `statusCode` in the message
* The `Join` node waits until all TV response codes from the split messages have arrived
* The `response json` node creates another payload that shall be sent back through MQTT. E.g. `{"status":"OK"}`
* The `publish response` node publishes the payload on a response topic 

## Debugging

### Local deployment of the Lambda
Using the Serverless Application Model Command Line Interface 
([SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html))
the Skill can be started and debugged locally.
Run the following command to send a _Discovery.request_ event to the lambda and open a debugger port.
Note that the function name _MySmartHomeSkill_ represents the name given to the Skill in the _template.yml_ file.
```
sam local invoke -e test/events/Discovery.request.json -d 5858 MySmartHomeSkill
```
The debugging option _-d 5858_ can be omitted.
If present the command waits for a debugger to connect on port 5858.
In case you want to connect Intellij IDEA as debugger select _Attach to Node.js/Chrome_
as _Run/Debug Configuration_ and adjust the port to 5858.

### Lambda deployed to the cloud
The Lambda logs to the AWS [CloudWatch](https://aws.amazon.com/cloudwatch) service.
The logs can be found in the AWS Console under _CloudWatch_ -> _Protocols_.

### MQTT
In the AWS Console und _IoT Core_ -> _Settings_ it is possible
to make the service report problems to CloudWatch as well.
This turned out to be helpful debugging authentication/connection problems.

### Node-RED
In Node-RED one can activate the green _debug nodes_ by pushing the button on their side.
After clicking the _deploy_ button again Node-RED writes the messages of the connected node
into the debug area on the ride side of the screen.
By clicking the button on the side of the `inject example` node it is also possible
to simulate an incoming MQTT message from the cloud.

### Alexa
In the [Alexa developer console](https://developer.amazon.com/alexa/console/ask)
select _mysmarthome skill_ -> _Test_ -> _Alexa Simulator_.
In the text field it is possible to type utterances and see/hear the results from Alexa.

# Irdroid
Setting up Irdroid on the Raspberry PI requires the setup of a patched version of
[lirc](https://www.irdroid.com/downloads/?did=16) available from the Irdroid website.
The relevant config files are located in the folder [/etc](images/etc).
The systemd [lirc.service](images/lirc.service) definition
must be located in the folder _/lib/systemd/system/lirc.service_.
Relevant commands for setting up lirc are:
```
# Use Irdroid to record the IR signals from the original TZ 602 remote 
irrecord -d /dev/ttyACM0 TZ_602.conf

# send a lirc command
irsend SEND_ONCE TZ_602 KEY_BRIGHTNESS_CYCLE
```
