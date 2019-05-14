### How to send a message to connect.me app

#### Prerequisite
- libvcx, libindy, libnullpay/libsovtoken binary for platform from where script needs to be running
- We should be able to call libvcx methods successfully
- We have code that can establish connection

> we can refer to a python script which is added below and has all steps for establishing a connection and sending a message and wait 50 seconds for response from user

### Steps
- Create a JSON of this format. Refer for validation rules further
```js
{
  '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/committedanswer/1.0/question',
  '@id': '518be002-de8e-456e-b3d5-8fe472477a86',
  'question_text': 'Alice, are you on the phone with Bob from Faber Bank right now?',
  'question_detail': 'This is optional fine-print giving context to the question and its various answers.',
  'valid_responses': [
    {'text': 'Yes, it is me', 'nonce': '<unique_identifier_a+2018-12-13T17:00:00+0000>'},
    {'text': 'No, that is not me!', 'nonce': '<unique_identifier_b+2018-12-13T17:00:00+0000'}
  ],
  '@timing': {
    'expires_time': 'future'
  },
  'external_links': [
    {'text': 'Some external link', 'src': 'https://www.externalwebsite.com/'},
    {'src': 'https://www.directlinkwithouttext.com/'},
  ]
}
```
- Stringify above JSON and call libvcx method connection_send_message
```js
await connection.send_message(JSON.stringify(aboveJson), "Question", question_text)
```
- User should receive a message with above data
- Once user responds, we can use libvcx method vcx_messages_download method to download user response
```python
  # check our own message for changes in refMsgId property
  originalMessage = await vcx_messages_download('', "{}".format(msg_id.decode('utf-8')), None)
  originalMessage = json.loads(originalMessage.decode('utf-8'))
  # get user's response message id from message that we sent
  responseMessageId = originalMessage[0]['msgs'][0]['refMsgId']
  # download user response for message that we sent
  userResponseMessage = await vcx_messages_download('', "{}".format(responseMessageId), None)
```
- User response should look like
```js
{
  '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/committedanswer/1.0/answer',
  'response.@sig': {
    'signature': 'wK0/2hGn7Auf831PESB9uOD1YgruPIRjhqfdPH8i2cUcN/YAhaYxN8fAWSLo9bmjILd+1sJCn6FvghmY5+H8CA==',
    'sig_data': 'PHVuaXF1ZV9pZGVudGlmaWVyX2ErMjAxOC0xMi0xM1QxNzowMDowMCswMDAwPg==',
    'timestamp': '2018-12-13T17:29:34+0000'
  }
}
```
- Base64 decode signature and call libvcx verify_signature
- Base64 decode data and check which nonce user replied with

### Validation Rules

- In message JSON, property `valid_responses` is required and it should be a JSON array of objects with type `{ text: string, nonce: string }`
- `@id` and `@type` are required
- Other properties are not required
- If `question_detail` or `question_text` or both are passed, they have to be of string type. Otherwise app won't show them on UI
- If `external_links` is specified, then it should be a JSON array of objects with type `{ text?: string, src: string}`. In this object `text` is optional. As of now we support only those links which mobile OS can directly open. So, links that start with other app's url schemes such as `tel:`, `instagram://`, etc. won't be opened. Property `src` should have valid scheme for it to open in browser. For example: `www.google.com` is an invalid link, `https://www.google.com` is correct link since it specifies the scheme of link.
- Here are different validation error with codes that could occur on UI
```js

ERROR_NO_QUESTION_DATA = {
  code: 'CM-QUE-004',
  message: 'No data received for this message.',
}

ERROR_NO_RESPONSE_ARRAY = {
  code: 'CM-QUE-005',
  message: 'Property valid_responses should be a JSON array.',
}

ERROR_NOT_ENOUGH_RESPONSES = {
  code: 'CM-QUE-006',
  message: 'Property valid_responses should have at least one response.',
}

ERROR_TOO_MANY_RESPONSES = {
  code: 'CM-QUE-007',
  message: 'There are more than 1000 responses.',
}

ERROR_RESPONSE_NOT_PROPERLY_FORMATTED = {
  code: 'CM-QUE-008',
  message:
    'One or more of response in valid_responses property is not in correct format {text: string, nonce: string}.',
}

ERROR_RESPONSE_NOT_UNIQUE_NONCE = {
  code: 'CM-QUE-009',
  message: 'Not every response in valid_responses array has unique nonce',
}

ERROR_EXTERNAL_LINKS_NOT_ARRAY = {
  code: 'CM-QUE-010',
  message: 'property "external_links" should be an array of object type { text?:string, src:string }'
}

ERROR_EXTERNAL_LINKS_NOT_PROPERLY_FORMATTED = {
  code: 'CM-QUE-011',
  message: 'One or more link object inside "external_links" array is invalid. Link object should be of format { text?:string, src:string }, where "text" property is optional. However, if "text" property is defined, then it should be a string with less than or equal to 1000 characters. "src" property should be a string and is not optional.'
}

ERROR_TOO_MANY_EXTERNAL_LINKS = {
  code: 'CM-QUE-012',
  message: '"external_links" array should not have more than 1000 link objects.'
}
```

### How UI renders responses
- If there is exactly one object in `valid_responses` array. Then no radio buttons would be rendered. This one response would be rendered as a primary actionable button (green button) in bottom of message screen. Text of this button would be set from object's `text` property. There is limit on number of characters that can be displayed on button. For smaller width devices (for example: iphone 5), at most 17 characters would be displayed on this action button. For bigger width devices such as iphone 7 at most 20 characters would be shown.
- If there are exactly two objects in `valid_responses` array, then first object would be considered primary response. This primary response would be rendered as primary action button. Second object would also be rendered as secondary action button. There is a limit of 40 characters on big devices, and 35 characters on small devices.
- If there are more than objects in `valid_responses` array, then all responses would be rendered as radio buttons and put in a scrollable view. There is no limit on number of characters in this case.
- If there are more than 20 objects in `valid_responses` array. Then only first 20 responses would be rendered as radio buttons.
- If there are more than 1000 objects in `valid_responses` array. UI would throw validation error with code `CM-QUE-007`


#### Test script

<details>
  <summary>Python test script to send message</summary>
  <p>

```python
#!/usr/bin/env python3

from ctypes import cdll
from vcx.api.vcx_init import vcx_init, vcx_init_with_config
from vcx.api.utils import vcx_agent_provision, vcx_messages_download
from vcx.api.connection import Connection
from vcx.error import VcxError
from vcx.state import State
from multiprocessing import Process, Queue
from time import sleep

import shutil
import logging
import asyncio
import sys
import os
import json
import base64
import datetime
import time
# import qrcode

# Test to validate the provable question/answer


def start_send_connection():
    loop = asyncio.get_event_loop()
    try:
        print("\tStart start_send_connection process (enterprise)...\n")
        logger.info("Start thread for send connection")
        loop.run_until_complete(asyncio.wait_for(ent_create_connection(), timeout=2000))
    except asyncio.TimeoutError:
        print("::FAILED::\tFailed to send connection request - enterprise!")
        logger.exception('::FAILED::\tFailed to send connection request - enterprise!')
        pass
    finally:
        loop.stop()
        loop.close()


def start_accept_connection():
    loop = asyncio.get_event_loop()
    try:
        print("\tStart start_accept_connection process (consumer)...")
        logger.info("Start thread for accept connection")
        loop.run_until_complete(asyncio.wait_for(con_accept_connection(), timeout=20))
    except asyncio.TimeoutError:
        print("::FAILED::\tFailed to accept connection request - consumer!")
        logger.exception("::FAILED::\tFailed to accept connection request - consumer!")
        pass
    finally:
        loop.stop()
        loop.close()


async def ent_create_connection():
    # Provision first then run the test
    config = await provision_enterprise()

    question = {
        '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/committedanswer/1.0/question',
        '@id': '518be002-de8e-456e-b3d5-8fe472477a86',
        'question_text': 'Alice, are you on the phone with Bob from Faber Bank right now?',
        'question_detail': 'This is optional fine-print giving context to the question and its various answers.',
        'valid_responses': [
            {'text': 'Yes, it is me', 'nonce': '<unique_identifier_a+2018-12-13T17:00:00+0000>'},
            {'text': 'No, that is not me!', 'nonce': '<unique_identifier_b+2018-12-13T17:00:00+0000'}],
        '@timing': {
            'expires_time': future
        },
        'external_links': [
            {'text': 'Some external link', 'src': 'https://www.externalwebsite.com/'},
            {'src': 'https://www.directlinkwithouttext.com/'},
        ]
    }

    # Init the payment plug-in
    if pmt_method == 'null':
        lib = cdll.LoadLibrary("libnullpay.dylib")
        lib.nullpay_init()
    else:
        lib = cdll.LoadLibrary("libsovtoken.dylib")
        lib.sovtoken_init()

    # Init using the config
    try:
        await vcx_init_with_config(json.dumps(config))
        logger.info('Vcx init complete (enterprise)')
    except VcxError as e:
        print("Could not initialize VCX: {0}".format(e))
        logger.exception("Could not initialize VCX (enterprise): {0}".format(e))

    connection = await Connection.create('123')
    assert await connection.get_state() == State.Initialized

    logger.info("--  use public did:{}".format(use_public_did))
    if use_public_did:
        await connection.connect('{"use_public_did":true,"connection_type":"QR"}')
        invite_details = await connection.invite_details(True)
        print("\t-- Send_offer: invite_details:", invite_details)
        my_invite_details.put(invite_details)
    else:
        await connection.connect('{"connection_type":"QR"}')
        invite_details = await connection.invite_details(True)
        print('\n %s \n' % str(json.dumps(invite_details)))
        # img = qrcode.make(str(json.dumps(invite_details)))
        # img.save("qr.png")


    # state = 0
    # RETRY = 1
    # while state != 4:
    #     await asyncio.sleep(5)
    #     print("calling update_state")
    #     state = await connection.update_state()
    #     print(state)
    #     RETRY += 1
    #     if RETRY == 500:
    #         state = 6
    #         break

    connection_state = await connection.get_state()
    while connection_state != State.Accepted:
        await asyncio.sleep(15)
        print("calling update_state")
        await connection.update_state()
        connection_state = await connection.get_state()
        print(connection_state)

    print("DONE calling update_state" + str(connection_state))

    # # Serialize the connection to see if it worked
    # try:
    #     await connection.serialize()
    #     print("-- Connection serialized")
    #     Vars.test_status.record_results(1, "::PASS:: Connection was accepted", Vars.file_name)
    # except VcxError as e:
    #     print("::ERROR:: %s" % e)
    #     Vars.test_status.record_results(1, "::FAILED::\tConnection was not accepted", Vars.file_name)

    # Question ============================================================
    msg_id = await connection.send_message(json.dumps(question), "Question", "Enterprise has asked you a question")
    print("\n-- Question sent")
    logger.info("-- Question sent")

    # Put the question in the queue
    print("Question: {}".format(msg_id.decode('utf-8')))
    _question_q.put(msg_id.decode('utf-8'))
    logger.info("-- Question in the queue for the consumer, question: {}".format(msg_id.decode('utf-8')))

    await asyncio.sleep(50)

    # get the answer
    # uid = _answer_q.get()

    try:
        originalMessage = await vcx_messages_download('', "{}".format(msg_id.decode('utf-8')), None)
        originalMessage = json.loads(originalMessage.decode('utf-8'))
        responseMessageId = originalMessage[0]['msgs'][0]['refMsgId']
        messages = await vcx_messages_download('', "{}".format(responseMessageId), None)
        # messages = json.loads(messages) # Python3.6
        print("-- Enterprise message downloaded")
        logger.info("-- Enterprise message downloaded")
    except VcxError as e:
        print("\n::ERROR:: Enterprise message failed to download\n{}".format(e))
        logger.exception("Failed to download message")

    messages = json.loads(messages.decode('utf-8'))
    answer = json.loads(json.loads(messages[0]['msgs'][0]['decryptedPayload'])['@msg'])

    #   {'@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/committedanswer/1.0/answer',
    #    'response.@sig': {
    #       'signature': 'wK0/2hGn7Auf831PESB9uOD1YgruPIRjhqfdPH8i2cUcN/YAhaYxN8fAWSLo9bmjILd+1sJCn6FvghmY5+H8CA==',
    #       'sig_data': 'PHVuaXF1ZV9pZGVudGlmaWVyX2ErMjAxOC0xMi0xM1QxNzowMDowMCswMDAwPg==',
    #       'timestamp': '2018-12-13T17:29:34+0000'}
    #   }

    signature = base64.b64decode(answer['response.@sig']['signature'])
    data = answer['response.@sig']['sig_data']
    valid = await connection.verify_signature(data.encode(), signature)
    logger.info("-- Signature verified for message...")

    if valid:
        print("-- Answer digitally signed: ", base64.b64decode(data))
        logger.info("\n\n::PASS:: Provable question sent/received and digitally signed")
    else:
        print("-- Signature was not valid")
        logger.info("::FAILED::  Provable question was not sent/received or signed")


async def con_accept_connection():
    # Provision first then run the test
    config = await provision_consumer()

    # Init the payment plug-in
    if pmt_method == 'null':
        lib = cdll.LoadLibrary("libnullpay.dylib")
        lib.nullpay_init()
    else:
        lib = cdll.LoadLibrary("libsovtoken.dylib")
        lib.sovtoken_init()

    # Init using the config
    try:
        await vcx_init_with_config(json.dumps(config))
        logger.info('Vcx init complete (consumer)')
    except VcxError as e:
        print("Could not initialize VCX (consumer): {0}".format(e))
        logger.exception("Could not initialize VCX (consumer): {0}".format(e))

    # Get the invite details out of the queue
    invite_details = my_invite_details.get()

    if debug:
        print('\t-- Received invite_details: %s' % invite_details)

    # Create the connection
    connection = await Connection.create_with_details('456', json.dumps(invite_details))
    await connection.connect('')
    await connection.update_state()

    # Answer =================================================================
    print("\n-- Wait for Enterprise to issue a question")
    # uid = input('uid: ')
    uid = _question_q.get()

    try:
        messages = await vcx_messages_download('MS-103', uid, None)
        logger.info("-- Message downloaded (consumer)")
        # messages = json.loads(messages) # Python3.6
        print("-- Consumer message downloaded")
    except VcxError as e:
        print("\n::ERROR:: Consumer message failed to download\n{}".format(e))
        logger.exception("Consumer failed to download message")

    messages = json.loads(messages.decode('utf-8'))
    question = json.loads(json.loads(messages[0]['msgs'][0]['decryptedPayload'])['@msg'])

    #    {'@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/committedanswer/1.0/question',
    #     '@id': '518be002-de8e-456e-b3d5-8fe472477a86',
    #     'question_text': 'Alice, are you on the phone with Bob from Faber Bank right now?',
    #     'question_detail': 'This is optional fine-print giving context to the question and its various answers.',
    #     'valid_responses': [
    #        {'text': 'Yes, it is me', 'nonce': '<unique_identifier_a+2018-12-13T17:00:00+0000'},
    #        {'text': 'No, that is not me!', 'nonce': '<unique_identifier_b+2018-12-13T17:00:00+0000'}],
    #     '@timing': {'expires_time': '2018-12-13T17:29:06+0000'}
    #    }

    data = base64.b64encode(question['valid_responses'][0]['nonce'].encode())
    signature = await connection.sign_data(data)
    logger.info("-- Consumer signed data")

    answer = {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/committedanswer/1.0/answer",
        "response.@sig": {
            "signature": base64.b64encode(signature).decode('utf-8'),
            "sig_data": data.decode('utf-8'),
            "timestamp": now
        }
    }
    msg_id = await connection.send_message(json.dumps(answer), "Answer", "Consumer answer sent")
    logger.info("-- consumer answer sent to enterprise")

    # Put the answer in the queue
    print("Answer: {}".format(msg_id.decode('utf-8')))
    _answer_q.put(msg_id.decode('utf-8'))
    logger.info("Answer: {}".format(msg_id.decode('utf-8')))


async def provision_enterprise():
    """
    Provision enterprise
    The agency DID, Verkey and URL should point to the agency to be used.  The rest of the fields are configurable
    Add the institution name, logo url and genesis path

    """

    print("\n-- Provision the enterprise")

    enterprise_config = {
        'agency_url': ent_agency_url,
        'agency_did': ent_agency_did,
        'agency_verkey': ent_agency_verkey,
        'wallet_name': ent_wallet_name,
        'wallet_key': wallet_key,
        'enterprise_seed': enterprise_seed
    }

    if debug:
        print("\n\n*********************************************")
        print("::provision_enterprise:: Enterprise config:\n{0}".format(json.dumps(enterprise_config, indent=2,
                                                                                   sort_keys=True)))
        print("*********************************************")

    config = await vcx_agent_provision(json.dumps(enterprise_config))
    config = json.loads(config)

    # Set remaining configuration options specific to the enterprise
    config['payment_method'] = pmt_method
    config['institution_name'] = ent_instituion_name
    config['institution_logo_url'] = ent_instituion_logo
    config['genesis_path'] = genesis_file_location

    if debug:
        print("\n\n*********************************************")
        print("::provision_enterprise:: Enterprise config:\n{0}".format(json.dumps(config, indent=2, sort_keys=True)))
        print("*********************************************")

    return config


async def provision_consumer():
    """
    Provision consumer
    The agency DID, Verkey and URL should point to the agency to be used.  The rest of the fields are configurable
    Add the institution name, logo url and genesis path

    """

    print("\n-- Provision the consumer")

    consumer_config = {
        'agency_url': con_agency_url,
        'agency_did': con_agency_did,
        'agency_verkey': con_agency_verkey,
        'wallet_name': con_wallet_name,
        'wallet_key': wallet_key,
        'enterprise_seed': enterprise_seed
    }

    if debug:
        print("\n\n*********************************************")
        print("::provision_consumer:: Consumer config:\n{0}".format(json.dumps(consumer_config, indent=2,
                                                                               sort_keys=True)))
        print("*********************************************")

    config = await vcx_agent_provision(json.dumps(consumer_config))
    config = json.loads(config)

    # Set some additional configuration options specific to consumer
    config['payment_method'] = pmt_method
    config['institution_name'] = con_instituion_name
    config['institution_logo_url'] = con_instituion_logo
    config['genesis_path'] = genesis_file_location

    if debug:
        print("\n\n*********************************************")
        print("::provision_consumer:: Consumer config:\n{0}".format(json.dumps(config, indent=2, sort_keys=True)))
        print("*********************************************")

    return config


def clean_start():
    """
    Erase existing wallets if they exist
    :return:
    """

    print("Remove test wallets...")
    remove_these = [con_wallet_name, ent_wallet_name]
    wallet_path = '~/.indy_client/wallet'

    for _ in remove_these:
        check = wallet_path + os.sep + _
        if os.path.exists(check):
            print("\nRemoving {0}".format(check))
            shutil.rmtree(check, ignore_errors=True)
        else:
            print("Could not find {} or the wallet does not exist".format(check))


def provable_q_and_a():

    if debug:
        logging.basicConfig(level=5)

    p_enterprise = Process(target=start_send_connection)
    # p_consumer = Process(target=start_accept_connection)

    print("\tStart start_send_connection process (enterprise)...\n")
    p_enterprise.start()
    sleep(2)

    # print("\tStart start_accept_connection process (consumer)...")
    # p_consumer.start()
    # sleep(2)

    p_enterprise.join()
    # p_enterprise.wait()
    # Popen.wait()
    # p_consumer.join()    # -----


if __name__ == '__main__':
    print("If you are on a mac do...")
    print("Usage: python3 ./test_QA_provable_question_answer.py")

    # Enable logging
    debug = False

    # Show the public DID for the connection
    # False means use a QR code
    use_public_did = True

    # The invite details will be transferred using queue
    my_invite_details = Queue()
    _question_q = Queue()
    _answer_q = Queue()

    # Show the test results
    show_result = True

    # Message expiration - set to 2 days in the future...
    now = datetime.datetime.today().strftime("%Y-%m-%dT%H:%M:%S+0000")
    future = (datetime.datetime.now() + datetime.timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%S+0000")

    # Agency and wallet info
    wallet_key = 'provableinfowalletkey'
    genesis_file_location = './genesis.txt'
    enterprise_seed = '000000000000000000000000Trustee1'
    pmt_method = 'null'
    ent_instituion_name = 'Test enterprise'
    ent_instituion_logo = 'http://robohash.org/532'
    con_instituion_name = 'Test consumer'
    con_instituion_logo = 'http://robohash.org/674'

    # TestNet agency information
    print("\nUse TestNet settings")
    ent_wallet_name = 'ent_provable-wallet'
    ent_agency_url = 'http://eas01.pps.evernym.com'
    ent_agency_did = 'UNM2cmvMVoWpk6r3pG5FAq'
    ent_agency_verkey = 'FvA7e4DuD2f9kYHq6B3n7hE7NQvmpgeFRrox3ELKv9vX'

    con_wallet_name = 'con_provable-wallet'
    con_agency_url = 'http://casq002.pqa.evernym.com'
    con_agency_did = 'L1gaixoxvbVg97HYnrr6rG'
    con_agency_verkey = 'BMzy1cEuSFvnKYjjBxY4jC2gQbNmaVX3Kg5zJJiXAwq8'

    # Details for log creation
    log_path = './python3'
    _name = os.path.basename(__file__)
    file_name = _name.split('.')
    t_stamp = time.strftime("%d-%m-%Y_%H-%M-%S")
    _file = log_path + os.sep + file_name[0] + '--Automation_tstresults_{}.log'.format(t_stamp)
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)

    # Create the file handler
    handler = logging.FileHandler(_file)
    handler.setLevel(logging.INFO)

    # Create the log format
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)

    # add the handlers to the logger
    logger.addHandler(handler)
    logger.info('\t###### Log file for {} ######'.format(_name))

    # Remove wallet if it exists
    clean_start()

    # Create a connection
    provable_q_and_a()

    # Show the results
    print("\nLog output found in {}".format(_file))
    print("Finished")
```
  </p>
</details>
