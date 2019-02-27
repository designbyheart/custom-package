import sys, asyncio, os, json

from indy.crypto import anon_decrypt
from indy.wallet import open_wallet


# Put this file at the base of ..../indy_sdk/wrappers/python/
async def main(wallet_name: str, log_file_path, log_file_name, vk, wallet_key):
    # did = 'L9DLGQNnAF4Y2jDJBnRP2q'
    config = json.dumps({"id": wallet_name})
    credentials = json.dumps({"key": wallet_key, "key_derivation_method": "RAW"})
    log_file_path = os.path.expanduser(log_file_path)

    # open wallet with decryption keys
    w_handle = await open_wallet(config, credentials)
    print("wallet opened with handle: %s" % w_handle)

    # read encrypted file
    encrypted_msg = read_encrypted_logs(log_file_path, log_file_name)
    print("encrypted file size: %s" % len(encrypted_msg))

    # decrypt wallet
    plaintext_logs = await anon_decrypt(w_handle, vk, encrypted_msg)
    print("decrypted file size: %s" % len(plaintext_logs))

    # write to file
    write_log_file_name = log_file_name.split(".")[0] + ".log"
    write_unencrypted_to_file(log_file_path, write_log_file_name, plaintext_logs.decode('utf-8'))


def read_encrypted_logs(path, logs_name):
    print("reading encrypted bytes from: " + path + '/' + logs_name)
    with open(os.path.join(path, logs_name), 'rb') as f:
        return f.read()


def write_unencrypted_to_file(path, logs_name, logs):
    with open(os.path.join(path, logs_name), 'w') as f:
        f.write(logs)
    print("wrote unencrypted log file to: " + path + '/' + logs_name)


if __name__ == '__main__':
    if len(sys.argv) < 6:
        print("missing necessary parameters")
        print("expected: wallet name, path to log file, name of log file, verification key, and wallet key")
        print("If you are on a mac do...")
        print("You MUST copy this script to the /Users/norm/forge/work/code/evernym/indy-sdk.evernym folder and run it from there or else it will not work")
        print("export DYLD_LIBRARY_PATH=[path_to_folder_containing_libindy.dylib]:${DYLD_LIBRARY_PATH}")
        print("ENV: export DYLD_LIBRARY_PATH=/Users/norm/.build_artifacts/libindy/master_6748627dcc42e9f3760411789f586d3c07b35138/target/x86_64-apple-darwin/release:${DYLD_LIBRARY_PATH}")
        print("Usage: python3 decrypt_logs.py LIBVCX_SDK_WALLET ~/Downloads kelly.testing.log.enc BS71ZbHNaN5XbPQ2Adg8wKvqL5xzKX2oFeNjTEvG1ho9 8dvfYSt5d1taSd6yJdpjq4emkwsPDDLYxkNFysFD2cZY")
        print("Where LIBVCX_SDK_WALLET is located at /Users/norm/.indy_client/wallet/LIBVCX_SDK_WALLET and the LIBVCX_SDK_WALLET folder contains sqlite.db")
        sys.exit(-1)
    wallet_name = str(sys.argv[1])
    logs_file_path = str(sys.argv[2])
    logs_file_name = str(sys.argv[3])
    vk = str(sys.argv[4])
    wallet_key = str(sys.argv[5])
    # wallet_name = "LIBVCX_SDK_WALLET"
    # logs_file_path = "~/Downloads"
    # logs_file_name = "norm_and_kelly_decrypt.log.enc"
    # vk = 'BS71ZbHNaN5XbPQ2Adg8wKvqL5xzKX2oFeNjTEvG1ho9'
    # wallet_key = "8dvfYSt5d1taSd6yJdpjq4emkwsPDDLYxkNFysFD2cZY"

    loop = asyncio.get_event_loop()
    loop.run_until_complete(main(wallet_name, logs_file_path, logs_file_name, vk, wallet_key))
