//  Created by react-native-create-bridge

package me.connect.rnindy;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import androidx.core.app.ActivityCompat;
import androidx.palette.graphics.Palette;
import android.util.Base64;
import android.util.Log;
import android.app.ActivityManager;
import android.app.ActivityManager.MemoryInfo;
import android.content.Context;
import android.content.ContextWrapper;
import android.net.Uri;
import android.os.Environment;

import me.connect.BridgeUtils;
import com.evernym.sdk.vcx.VcxException;
import com.evernym.sdk.vcx.wallet.WalletApi;
import com.evernym.sdk.vcx.connection.ConnectionApi;
import com.evernym.sdk.vcx.credential.CredentialApi;
import com.evernym.sdk.vcx.credential.GetCredentialCreateMsgidResult;
import com.evernym.sdk.vcx.proof.CreateProofMsgIdResult;
import com.evernym.sdk.vcx.proof.DisclosedProofApi;
import com.evernym.sdk.vcx.proof.ProofApi;
import com.evernym.sdk.vcx.token.TokenApi;
import com.evernym.sdk.vcx.utils.UtilsApi;
import com.evernym.sdk.vcx.vcx.AlreadyInitializedException;
import com.evernym.sdk.vcx.vcx.VcxApi;
import com.evernym.sdk.vcx.indy.IndyApi;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;
import java.util.Timer;
import java.util.TimerTask;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

public class RNIndyModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "RNIndy";
    public static final String TAG = "RNIndy::";
    private static final int BUFFER = 2048;
    private static ReactApplicationContext reactContext = null;
    // TODO:Remove this class once integration with vcx is done
    private static RNIndyStaticData staticData = new RNIndyStaticData();

    public RNIndyModule(ReactApplicationContext context) {
        // Pass in the context to the constructor and save it so you can emit events
        // https://facebook.github.io/react-native/docs/native-modules-android.html#the-toast-module
        super(context);

        reactContext = context;
    }

    @Override
    public String getName() {
        // Tell React the name of the module
        // https://facebook.github.io/react-native/docs/native-modules-android.html#the-toast-module
        return REACT_CLASS;
    }

    @ReactMethod
    public void createOneTimeInfo(String agencyConfig, Promise promise) {
        Log.d(TAG, "createOneTimeInfo()");
        // We have top create thew ca cert for the openssl to work properly on android
        BridgeUtils.writeCACert(this.getReactApplicationContext());

        try {
            UtilsApi.vcxAgentProvisionAsync(agencyConfig).exceptionally((t) -> {
                Log.e(TAG, "vcxGetProvisionToken - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                Log.d(TAG, "vcxGetProvisionToken: Success");
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void getProvisionToken(String agencyConfig, Promise promise) {
        Log.d(TAG, "getProvisionToken()");
        try {
            UtilsApi.vcxGetProvisionToken(agencyConfig).exceptionally((t) -> {
                Log.e(TAG, "vcxGetProvisionToken - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                Log.d(TAG, "vcxGetProvisionToken: Success");
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void createOneTimeInfoWithToken(String agencyConfig, String token, Promise promise) {
        Log.d(TAG, "createOneTimeInfoWithToken()");
        BridgeUtils.writeCACert(this.getReactApplicationContext());

        try {
            String result = UtilsApi.vcxAgentProvisionWithToken(agencyConfig, token);
            BridgeUtils.resolveIfValid(promise, result);
        } catch (VcxException e) {
            Log.e(TAG, "vcxAgentProvisionWithToken - Error: ", e);
            promise.reject("VCXException", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void getGenesisPathWithConfig(String poolConfig, String fileName, Promise promise) {
        Log.d(TAG, "getGenesisPathWithConfig()");
        ContextWrapper cw = new ContextWrapper(reactContext);
        File genFile = new File(cw.getFilesDir().toString() + "/genesis_" + fileName + ".txn");
        if (genFile.exists()) {
            genFile.delete();
        }

        try (FileOutputStream fos = new FileOutputStream(genFile)) {
            fos.write(poolConfig.getBytes());
            promise.resolve(genFile.getAbsolutePath());
        } catch (IOException e) {
            promise.reject("VCXException", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void init(String config, Promise promise) {
        Log.d(TAG, "init()");
        // When we restore data, then we are not calling createOneTimeInfo
        // and hence ca-crt is not written within app directory
        // since the logic to write ca cert checks for file existence
        // we won't have to pay too much cost for calling this function inside init
        BridgeUtils.writeCACert(this.getReactApplicationContext());

        try {
            int retCode = VcxApi.initSovToken();
            if(retCode != 0) {
                promise.reject("Could not init sovtoken", String.valueOf(retCode));
            } else {
                VcxApi.vcxInitWithConfig(config).exceptionally((t) -> {
                    Log.e(TAG, "vcxInitWithConfig - Error: ", t);
                    promise.reject("FutureException", t.getMessage());
                    return -1;
                }).thenAccept(result -> {
                    // Need to put this logic in every accept because that is how ugly Java's
                    // promise API is
                    // even if exceptionally is called, then also thenAccept block will be called
                    // we either need to switch to complete method and pass two callbacks as
                    // parameter
                    // till we change to that API, we have to live with this IF condition
                    // also reason to add this if condition is because we already rejected promise
                    // in
                    // exceptionally block, if we call promise.resolve now, then it `thenAccept`
                    // block
                    // would throw an exception that would not be caught here, because this is an
                    // async
                    // block and above try catch would not catch this exception
                    if (result != -1) {
                        promise.resolve(true);
                    }
                });
            }

        } catch (AlreadyInitializedException e) {
            // even if we get already initialized exception
            // then also we will resolve promise, because we don't care if vcx is already
            // initialized
            promise.resolve(true);
        } catch (VcxException e) {
            e.printStackTrace();
            promise.reject(e);
        }
    }

    @ReactMethod
    public void createConnectionWithInvite(String invitationId, String inviteDetails, Promise promise) {
        Log.d(TAG, "createConnectionWithInvite()");
        try {
            ConnectionApi.vcxCreateConnectionWithInvite(invitationId, inviteDetails).exceptionally((t) -> {
                Log.e(TAG, "vcxCreateConnectionWithInvite - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return -1;
            }).thenAccept(result -> {
                if (result != -1) {
                    BridgeUtils.resolveIfValid(promise, result);
                }
            });

        } catch (Exception e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void vcxAcceptInvitation(int connectionHandle, String connectionType, Promise promise) {
        Log.d(TAG, "acceptInvitation()");
        try {
            ConnectionApi.vcxAcceptInvitation(connectionHandle, connectionType).exceptionally((t) -> {
                Log.e(TAG, "vcxAcceptInvitation - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> BridgeUtils.resolveIfValid(promise, result));
        } catch (VcxException e) {
            e.printStackTrace();
            promise.reject(e);
        }
    }

    @ReactMethod
    public void vcxUpdatePushToken(String config, Promise promise) {
        try {
            UtilsApi.vcxUpdateAgentInfo(config).whenComplete((result, t) -> {
                if (t != null) {
                    Log.e(TAG, "vcxUpdateAgentInfo - Error: ", t);
                    promise.reject("FutureException", t.getMessage());
                } else {
                    promise.resolve(0);
                }
            });
        } catch (VcxException e) {
            e.printStackTrace();
            promise.reject(e);
        }
    }

    @ReactMethod
    public void connectionSendMessage(int connectionHandle, String message, String sendMessageOptions, Promise promise) {
        try {
            ConnectionApi.connectionSendMessage(connectionHandle, message, sendMessageOptions).exceptionally((t) -> {
                Log.e(TAG, "connectionSendMessage - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch(VcxException e) {
            e.printStackTrace();
            promise.reject(e);
        }
    }

    @ReactMethod
    public void connectionSignData(int connectionHandle, String data, String base64EncodingOption, boolean encode, Promise promise) {
        try {
            int base64EncodeOption = base64EncodingOption.equalsIgnoreCase("NO_WRAP") ? Base64.NO_WRAP : Base64.URL_SAFE;
            byte[] dataToSign = encode ? Base64.encode(data.getBytes(), base64EncodeOption) : data.getBytes();
            ConnectionApi.connectionSignData(connectionHandle, dataToSign, dataToSign.length).exceptionally((t) -> {
                Log.e(TAG, "connectionSignData - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                try {
                    // We would get Byte array from libvcx
                    // we cannot perform operation on Buffer inside react-native due to react-native limitations for Buffer
                    // so, we are converting byte[] to Base64 encoded string and then returning that data to react-native
                    if (result != null) {
                        // since we took the data from JS layer as simple string and
                        // then converted that string to Base64 encoded byte[]
                        // we need to pass same Base64 encoded byte[] back to JS layer, so that it can included in full message response
                        // otherwise we would be doing this calculation again in JS layer which does not handle Buffer
                        WritableMap signResponse = Arguments.createMap();
                        signResponse.putString("data", new String(dataToSign));
                        signResponse.putString("signature", Base64.encodeToString(result, base64EncodeOption));
                        promise.resolve(signResponse);
                    } else {
                        promise.reject("NULL-VALUE", "Null value was received as result from wrapper");
                    }
                } catch(Exception e) {
                    // it might happen that we get value of result to not be a byte array
                    // or we might get empty byte array
                    // in all those case outer try...catch will not work because this inside callback of a Future
                    // so we need to handle the case for Future callback inside that callback
                    promise.reject(e);
                }
            });
        } catch(VcxException e) {
            e.printStackTrace();
            promise.reject(e);
        }
    }

    @ReactMethod
    public void connectionVerifySignature(int connectionHandle, String data, String signature, Promise promise) {
        // Base64 decode signature because we encoded signature returned by libvcx to base64 encoded string
        // Convert data to just byte[], because base64 encoded byte[] was used to generate signature
        byte[] dataToVerify = data.getBytes();
        byte[] signatureToVerify = Base64.decode(signature, Base64.NO_WRAP);
        try {
            ConnectionApi.connectionVerifySignature(
                    connectionHandle, dataToVerify, dataToVerify.length, signatureToVerify, signatureToVerify.length
            ).exceptionally((t) -> {
                Log.e(TAG, "connectionVerifySignature - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch(VcxException e) {
            e.printStackTrace();
            promise.reject(e);
        }
    }

    @ReactMethod
    public void toBase64FromUtf8(String data, String base64EncodingOption, Promise promise) {
        try {
            int base64EncodeOption = base64EncodingOption.equalsIgnoreCase("NO_WRAP") ? Base64.NO_WRAP : Base64.URL_SAFE;
            promise.resolve(Base64.encodeToString(data.getBytes(), base64EncodeOption));
        } catch(Exception e) {
            e.printStackTrace();
            promise.reject(e);
        }
    }

    @ReactMethod
    public void toUtf8FromBase64(String data, String base64EncodingOption, Promise promise) {
        try {
            int base64EncodeOption = base64EncodingOption.equalsIgnoreCase("NO_WRAP") ? Base64.NO_WRAP : Base64.URL_SAFE;
            String decodedUtf8 = new String(Base64.decode(data, base64EncodeOption));
            promise.resolve(decodedUtf8);
        } catch(Exception e) {
            e.printStackTrace();
            promise.reject(e);
        }
    }

    @ReactMethod
    public void generateThumbprint(String data, String base64EncodingOption, Promise promise) {
        try {
            MessageDigest hash = MessageDigest.getInstance("SHA-256");
            hash.update(data.getBytes(StandardCharsets.UTF_8));
            int base64EncodeOption = base64EncodingOption.equalsIgnoreCase("NO_WRAP") ? Base64.NO_WRAP : Base64.URL_SAFE;
            byte[] digest = hash.digest();
            String base64EncodedThumbprint = Base64.encodeToString(digest, base64EncodeOption);
            promise.resolve(base64EncodedThumbprint);
        } catch (Exception e) {
            e.printStackTrace();
            promise.reject(e);
        }
    }

    @ReactMethod
    public void connectionGetState(int connectionHandle, Promise promise) {
        try {
            ConnectionApi.connectionGetState(connectionHandle).exceptionally((t) -> {
                Log.e(TAG, "connectionGetState - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return -1;
            }).thenAccept(result -> {
                if (result != -1) {
                    BridgeUtils.resolveIfValid(promise, result);
                }
            });
        } catch(Exception e) {
            e.printStackTrace();
            promise.reject(e);
        }
    }

    @ReactMethod
    public void connectionUpdateState(int connectionHandle, Promise promise) {
        try {
            ConnectionApi.vcxConnectionUpdateState(connectionHandle).exceptionally((t) -> {
                Log.e(TAG, "vcxConnectionUpdateState - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return -1;
            }).thenAccept(result -> {
                if (result != -1) {
                    BridgeUtils.resolveIfValid(promise, result);
                }
            });
        } catch(Exception e) {
            e.printStackTrace();
            promise.reject(e);
        }
    }

    @ReactMethod
    public void generateProof(String proofRequestId, String requestedAttrs, String requestedPredicates,
            String revocationInterval, String proofName, Promise promise) {
        try {
            ProofApi.proofCreate(proofRequestId, requestedAttrs, requestedPredicates, revocationInterval, proofName).exceptionally((t) -> {
                Log.e(TAG, "proofCreate - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return -1;
            }).thenAccept(result -> {
                if (result != -1) {
                    BridgeUtils.resolveIfValid(promise, result);
                }
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void getColor(String imagePath, final Promise promise) {
        Bitmap bitmap = BitmapFactory.decodeFile(imagePath);
        Palette.from(bitmap).generate(new Palette.PaletteAsyncListener() {
            @Override
            public void onGenerated(Palette palette) {
                try {
                    Palette.Swatch swatch = palette.getVibrantSwatch();
                    if (swatch == null) {
                        swatch = palette.getDarkVibrantSwatch();
                    }
                    if (swatch == null) {
                        swatch = palette.getLightVibrantSwatch();
                    }
                    if (swatch == null) {
                        swatch = palette.getMutedSwatch();
                    }
                    if (swatch == null) {
                        swatch = palette.getDarkMutedSwatch();
                    }
                    if (swatch == null) {
                        swatch = palette.getLightMutedSwatch();
                    }
                    if (swatch == null) {
                        swatch = palette.getDominantSwatch();
                    }
                    if (swatch == null) {
                        List<Palette.Swatch> swatchList = palette.getSwatches();
                        for (Palette.Swatch swatchItem : swatchList) {
                            if (swatchItem != null) {
                                swatch = swatchItem;
                                break;
                            }
                        }
                    }

                    int rgb = swatch.getRgb();
                    int r = Color.red(rgb);
                    int g = Color.green(rgb);
                    int b = Color.blue(rgb);
                    WritableArray colors = Arguments.createArray();
                    colors.pushString(String.valueOf(r));
                    colors.pushString(String.valueOf(g));
                    colors.pushString(String.valueOf(b));
                    // add a value for alpha factor
                    colors.pushString("1");
                    promise.resolve(colors);
                } catch (Exception e) {
                    promise.reject("No color", e);
                }
            }
        });
    }

    @ReactMethod
    public void reset(boolean reset, final Promise promise) {
        // TODO: call vcx_reset or vcx_shutdown if later is available
        // pass true to indicate that we delete both pool and wallet objects
        Timer t = new Timer();
        t.schedule(new TimerTask() {
            @Override
            public void run() {
                promise.resolve(true);
            }
        }, (long) (Math.random() * 1000));
    }

    @ReactMethod
    public void backupWallet(String documentDirectory, String encryptionKey, String agencyConfig, Promise promise) {
        // TODO: Remove this file, this is a dummy file, testing for backup the wallet
        String fileName = "backup.txt";
        File file = new File(documentDirectory, fileName);
        String contentToWrite = "Dummy Content";
        try (FileWriter fileWriter = new FileWriter(file)) {
            fileWriter.append(contentToWrite);
            fileWriter.flush();
        } catch (IOException e) {
            promise.reject(e);
        }

        // convert the file to zip
        String inputDir = documentDirectory + "/" + fileName;
        String zipPath = documentDirectory + "/backup.zip";
        try (FileOutputStream dest = new FileOutputStream(zipPath);
                ZipOutputStream out = new ZipOutputStream(new BufferedOutputStream(dest));
                FileInputStream fi = new FileInputStream(inputDir);
                BufferedInputStream origin = new BufferedInputStream(fi);) {
            byte data[] = new byte[BUFFER];
            // fileName will be the wallet filename
            ZipEntry entry = new ZipEntry(fileName);
            out.putNextEntry(entry);
            int count;
            while ((count = origin.read(data, 0, BUFFER)) != -1) {
                out.write(data, 0, count);
            }
            out.closeEntry();
            promise.resolve(zipPath);
        } catch (IOException e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getSerializedConnection(int connectionHandle, Promise promise) {
        // TODO:KS call vcx_connection_serialize and pass connectionHandle
        try {
            ConnectionApi.connectionSerialize(connectionHandle).exceptionally((t) -> {
                Log.e(TAG, "connectionSerialize - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
            e.printStackTrace();
        }
    }


    private static void requestPermission(final Context context) {
        if(ActivityCompat.shouldShowRequestPermissionRationale((Activity) context, Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
            // Provide an additional rationale to the user if the permission was not granted
            // and the user would benefit from additional context for the use of the permission.
            // For example if the user has previously denied the permission.

            new AlertDialog.Builder(context)
                    .setMessage("permission storage")
                    .setPositiveButton("positive button", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    ActivityCompat.requestPermissions((Activity) context,
                            new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                            RNIndyStaticData.REQUEST_WRITE_EXTERNAL_STORAGE);
                }
            }).show();

        } else {
            // permission has not been granted yet. Request it directly.
            ActivityCompat.requestPermissions((Activity)context,
                    new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                    RNIndyStaticData.REQUEST_WRITE_EXTERNAL_STORAGE);
        }
    }

    private static int getLogLevel(String levelName) {
        if("Error".equalsIgnoreCase(levelName)) {
            return 1;
        } else if("Warning".equalsIgnoreCase(levelName) || levelName.toLowerCase().contains("warn")) {
            return 2;
        } else if("Info".equalsIgnoreCase(levelName)) {
            return 3;
        } else if("Debug".equalsIgnoreCase(levelName)) {
            return 4;
        } else if("Trace".equalsIgnoreCase(levelName)) {
            return 5;
        } else {
            return 3;
        }
    }

    @ReactMethod
    public void encryptVcxLog(String logFilePath, String key, Promise promise) {

        try {
            RandomAccessFile logFile = new RandomAccessFile(logFilePath, "r");
            byte[] fileBytes = new byte[(int)logFile.length()];
            logFile.readFully(fileBytes);
            logFile.close();

            IndyApi.anonCrypt(key, fileBytes).exceptionally((t) -> {
                Log.e(TAG, "anonCrypt: ", t);
                promise.reject("FutureException", "Error occurred while encrypting file: " + logFilePath + " :: " + t.getMessage());
                return null;
            }).thenAccept(result -> {
                try {
                    RandomAccessFile encLogFile = new RandomAccessFile(RNIndyStaticData.ENCRYPTED_LOG_FILE_PATH, "rw");
                    encLogFile.write(result, 0, result.length);
                    encLogFile.close();
                    BridgeUtils.resolveIfValid(promise, RNIndyStaticData.ENCRYPTED_LOG_FILE_PATH);
                } catch(IOException ex) {
                    promise.reject("encryptVcxLog Exception", ex.getMessage());
                    ex.printStackTrace();
                }
            });
        } catch (VcxException | IOException e) {
            promise.reject("encryptVcxLog Exception", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public  void writeToVcxLog(String loggerName, String logLevel, String message, String logFilePath, Promise promise) {
        VcxApi.logMessage(loggerName, getLogLevel(logLevel), message);
        promise.resolve(0);
    }

    @ReactMethod
    public void setVcxLogger(String logLevel, String uniqueIdentifier, int MAX_ALLOWED_FILE_BYTES, Promise promise) {

        ContextWrapper cw = new ContextWrapper(reactContext);
        RNIndyStaticData.MAX_ALLOWED_FILE_BYTES = MAX_ALLOWED_FILE_BYTES;
        RNIndyStaticData.LOG_FILE_PATH = cw.getFilesDir().getAbsolutePath() +
                "/connectme.rotating." + uniqueIdentifier + ".log";
        RNIndyStaticData.ENCRYPTED_LOG_FILE_PATH = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath() +
                "/connectme.rotating." + uniqueIdentifier + ".log.enc";
        //get the documents directory:
        Log.d(TAG, "Setting vcx logger to: " + RNIndyStaticData.LOG_FILE_PATH);

        if (Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState())) {
            RNIndyStaticData.initLoggerFile(cw);
        }
        promise.resolve(RNIndyStaticData.LOG_FILE_PATH);

    }

    @ReactMethod
    public void deserializeConnection(String serializedConnection, Promise promise) {
        // TODO call vcx_connection_deserialize and pass serializedConnection
        // it would return an error code and an integer connection handle in callback
        try {
            ConnectionApi.connectionDeserialize(serializedConnection).exceptionally((t) -> {
                Log.e(TAG, "connectionDeserialize - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return -1;
            }).thenAccept(result -> {
                if (result != -1) {
                    BridgeUtils.resolveIfValid(promise, result);
                }
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void credentialCreateWithOffer(String sourceId, String credOffer, Promise promise) {
        try {
            CredentialApi.credentialCreateWithOffer(sourceId, credOffer).exceptionally((t) -> {
                Log.e(TAG, "credentialCreateWithOffer - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return -1;
            }).thenAccept(result -> {
                Log.e(TAG, ">>>><<<< got result back");
                if (result != -1) {
                    BridgeUtils.resolveIfValid(promise, result);
                }
            });
        } catch(VcxException e) {
            promise.reject("VCXException", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void serializeClaimOffer(int credentialHandle, Promise promise) {
        // it would return error code, json string of credential inside callback

        try {
            CredentialApi.credentialSerialize(credentialHandle).exceptionally((t) -> {
                Log.e(TAG, "credentialSerialize - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
            e.printStackTrace();
        }

    }

    @ReactMethod
    public void deserializeClaimOffer(String serializedCredential, Promise promise) {
        // it would return an error code and an integer credential handle in callback

        try {
            CredentialApi.credentialDeserialize(serializedCredential).exceptionally((t) -> {
                Log.e(TAG, "credentialDeserialize - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return -1;
            }).thenAccept(result -> {
                if (result != -1) {
                    BridgeUtils.resolveIfValid(promise, result);
                }
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void sendClaimRequest(int credentialHandle, int connectionHandle, int paymentHandle, Promise promise) {
        // it would return an error code in callback
        // we resolve promise with an empty string after success
        // or reject promise with error code

        try {
            CredentialApi.credentialSendRequest(credentialHandle, connectionHandle, paymentHandle).whenComplete((result, t) -> {
                if (t != null) {
                    Log.e(TAG, "credentialSendRequest - Error: ", t);
                    promise.reject("FutureException", t.getMessage());
                } else {
                    promise.resolve(0);
                }
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void updateClaimOfferState(int credentialHandle, Promise promise) {
        try {
            CredentialApi.credentialUpdateState(credentialHandle).exceptionally((t) -> {
                Log.e(TAG, "credentialUpdateState - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return -1;
            }).thenAccept(result -> {
                if (result != -1) {
                    BridgeUtils.resolveIfValid(promise, result);
                }
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void getClaimOfferState(int credentialHandle, Promise promise) {
        try {
            CredentialApi.credentialGetState(credentialHandle).exceptionally((t) -> {
                Log.e(TAG, "credentialGetState - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return -1;
            }).thenAccept(result -> {
                if (result != -1) {
                    BridgeUtils.resolveIfValid(promise, result);
                }
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void getClaimVcx(int credentialHandle, Promise promise) {
        try {
            CredentialApi.getCredential(credentialHandle).exceptionally((t) -> {
                Log.e(TAG, "getCredential - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void exportWallet(String exportPath, String encryptionKey, Promise promise) {
        Log.d(TAG, "exportWallet()");
        try {
            WalletApi.exportWallet(exportPath, encryptionKey).exceptionally((t) -> {
                Log.e(TAG, "exportWallet - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return -1;
            }).thenAccept(result -> {
                if(result != -1){
                   BridgeUtils.resolveIfValid(promise, result);
                }
            });


        } catch (Exception e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void decryptWalletFile(String config, Promise promise) {
        try {
            WalletApi.importWallet(config).exceptionally((t) -> {
                Log.e(TAG, "importWallet - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return -1;
            }).thenAccept(result -> {
                if (result != -1) {
                    BridgeUtils.resolveIfValid(promise, result);
                }
            });
        } catch (Exception e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void copyToPath(String uri, String zipPath, Promise promise) {

        InputStream input = null;
        BufferedOutputStream output = null;
        try {

            input = reactContext.getContentResolver().openInputStream(Uri.parse(uri));
            output = new BufferedOutputStream(new FileOutputStream(zipPath));

            {
                byte data[] = new byte[BUFFER];
                int count;
                while ((count = input.read(data, 0, BUFFER)) != -1) {
                    output.write(data, 0, count);
                }
                input.close();
                output.close();
                promise.resolve(zipPath);
            }
        }

        catch (IOException e) {
            promise.reject("copyToPathException", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void setWalletItem(String key, String value, Promise promise) {
        try {
            WalletApi.addRecordWallet("record_type", key, value).whenComplete((result, t) -> {
                if (t != null) {
                    Log.e(TAG, "addRecordWallet - Error: ", t);
                    promise.reject("FutureException", t.getMessage());
                } else {
                    promise.resolve(0);
                }
            });
        } catch (VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void getWalletItem(String key, Promise promise) {
        try {
            WalletApi.getRecordWallet("record_type", key, "").exceptionally((t) -> {
                Log.e(TAG, "getRecordWallet - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void deleteWalletItem(String key, Promise promise) {
        try {
            WalletApi.deleteRecordWallet("record_type", key).whenComplete((result, t) -> {
                if (t != null) {
                    Log.e(TAG, "deleteRecordWallet - Error: ", t);
                    promise.reject("FutureException", t.getMessage());
                } else {
                    promise.resolve(0);
                }
            });
        } catch (VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void updateWalletItem(String key, String value, Promise promise) {
        try {
            WalletApi.updateRecordWallet("record_type", key, value).whenComplete((result, t) -> {
                if (t != null) {
                    Log.e(TAG, "updateRecordWallet - Error: ", t);
                    promise.reject("FutureException", t.getMessage());
                } else {
                    promise.resolve(0);
                }
            });
        } catch (VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void createWalletBackup(String sourceID, String backupKey, Promise promise) {
        try {
            WalletApi.createWalletBackup(sourceID, backupKey).exceptionally((t) -> {
                Log.e(TAG, "createWalletBackup - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }


    @ReactMethod
    public void backupWalletBackup(int walletBackupHandle, String path, Promise promise) {
        try {
            WalletApi.backupWalletBackup(walletBackupHandle, path).whenComplete((result, t) -> {
                if (t != null) {
                    Log.e(TAG, "backupWalletBackup - Error: ", t);
                    promise.reject("FutureException", t.getMessage());
                } else {
                    promise.resolve(0);
                }
            });
        } catch (VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void updateWalletBackupState(int walletBackupHandle, Promise promise) {
        try {
            WalletApi.updateWalletBackupState(walletBackupHandle).exceptionally((t) -> {
                Log.e(TAG, "updateWalletBackupState - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void updateWalletBackupStateWithMessage(int walletBackupHandle, String message, Promise promise ) {
        try {
            WalletApi.updateWalletBackupStateWithMessage(walletBackupHandle, message ).exceptionally((t) -> {
                Log.e(TAG, "updateWalletBackupStateWithMessage - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void serializeBackupWallet(int walletBackupHandle, Promise promise) {
        try {
            WalletApi.serializeBackupWallet(walletBackupHandle).exceptionally((t) -> {
                Log.e(TAG, "serializeBackupWallet - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void deserializeBackupWallet(String message, Promise promise) {
        try {
            WalletApi.deserializeBackupWallet(message).exceptionally((t) -> {
                Log.e(TAG, "deserializeBackupWallet - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void restoreWallet(String config, Promise promise) {
        try {
            WalletApi.restoreWalletBackup(config).whenComplete((result, t) -> {
                if (t != null) {
                    Log.e(TAG, "restoreWalletBackup - Error: ", t);
                    promise.reject("FutureException", t.getMessage());
                } else {
                    promise.resolve(0);
                }
            });
        } catch (VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void exitAppAndroid() {
        android.os.Process.killProcess(android.os.Process.myPid());
    }

    @ReactMethod
    public void proofRetrieveCredentials(int proofHandle, Promise promise) {
        try {
            DisclosedProofApi.proofRetrieveCredentials(proofHandle).exceptionally((t) -> {
                Log.e(TAG, "proofRetrieveCredentials - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void proofGenerate(int proofHandle, String selectedCredentials, String selfAttestedAttributes,
                              Promise promise) {
        try {
            DisclosedProofApi.proofGenerate(proofHandle, selectedCredentials, selfAttestedAttributes).whenComplete((result, t) -> {
                if (t != null) {
                    Log.e(TAG, "proofGenerate - Error: ", t);
                    promise.reject("FutureException", t.getMessage());
                } else {
                    promise.resolve(0);
                }
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void proofSend(int proofHandle, int connectionHandle, Promise promise) {
        try {
            DisclosedProofApi.proofSend(proofHandle, connectionHandle).whenComplete((result, t) -> {
                if (t != null) {
                    Log.e(TAG, "proofSend - Error: ", t);
                    promise.reject("FutureException", t.getMessage());
                } else {
                    promise.resolve(0);
                }
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void shutdownVcx(Boolean deleteWallet, Promise promise) {
        Log.d(TAG, "shutdownVcx()");
        try {
            VcxApi.vcxShutdown(deleteWallet);
            promise.resolve("");
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void getTokenInfo(int paymentHandle, Promise promise) {
        try {
            TokenApi.getTokenInfo(paymentHandle).exceptionally((t) -> {
                Log.e(TAG, "getTokenInfo - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void sendTokens(int paymentHandle, String tokens, String recipient, Promise promise) {
        try {
            TokenApi.sendTokens(paymentHandle, tokens, recipient).exceptionally((t) -> {
                Log.e(TAG, "sendTokens - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void createPaymentAddress(String seed, Promise promise) {
        try {
            TokenApi.createPaymentAddress(seed).exceptionally((t) -> {
                Log.e(TAG, "createPaymentAddress - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void deleteConnection(int connectionHandle, Promise promise) {
        try {
            ConnectionApi.deleteConnection(connectionHandle).whenComplete((result, t) -> {
                if (t != null) {
                    Log.e(TAG, "deleteConnection - Error: ", t);
                    promise.reject("FutureException", t.getMessage());
                } else {
                    promise.resolve(0);
                }
            });
        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void downloadMessages(String messageStatus, String uid_s, String pwdids, Promise promise) {
      Log.d(TAG, "downloadMessages()");
      try {
        UtilsApi.vcxGetMessages(messageStatus, uid_s, pwdids).exceptionally((t) -> {
          Log.e(TAG, "vcxGetMessages - Error: ", t);
          promise.reject("FutureException", t.getMessage());
          return null;
        }).thenAccept(result -> BridgeUtils.resolveIfValid(promise, result));

      } catch (VcxException e) {
        promise.reject("VCXException", e.getMessage());
      }
    }

    @ReactMethod
    public void vcxGetAgentMessages(String messageStatus, String uid_s, Promise promise) {
        Log.d(TAG, "vcxGetAgentMessages()");
        try {
            UtilsApi.vcxGetAgentMessages(messageStatus, uid_s).exceptionally((t) -> {
                Log.e(TAG, "vcxGetAgentMessages - Error: ", t);
                promise.reject("FutureException", t.getMessage());
                return null;
            }).thenAccept(result -> BridgeUtils.resolveIfValid(promise, result));

        } catch (VcxException e) {
            promise.reject("VCXException", e.getMessage());
        }
    }

    @ReactMethod
    public void updateMessages(String messageStatus, String pwdidsJson, Promise promise) {
      Log.d(TAG, "updateMessages()");

      try {
          UtilsApi.vcxUpdateMessages(messageStatus, pwdidsJson).whenComplete((result, t) -> {
              if (t != null) {
                  Log.e(TAG, "vcxUpdateMessages - Error: ", t);
                  promise.reject("FutureException", t.getMessage());
              } else {
                  promise.resolve(0);
              }
          });
      } catch (VcxException e) {
        promise.reject("FutureException", e.getMessage());
      }
    }

    @ReactMethod
    public void proofCreateWithRequest(String sourceId, String proofRequest, Promise promise) {
        Log.d(TAG, "proofCreateWithRequest()");

        try {
            DisclosedProofApi.proofCreateWithRequest(sourceId, proofRequest).exceptionally((t)-> {
                Log.e(TAG, "proofCreateWithRequest - Error: ", t);
                promise.reject("VcxException", t.getMessage());
                return -1;
            }).thenAccept(result -> {
                if (result != -1) {
                    BridgeUtils.resolveIfValid(promise, result);
                }
            });
        } catch(VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void proofSerialize(int proofHandle, Promise promise) {
        Log.d(TAG, "proofSerialize()");
        try {
            DisclosedProofApi.proofSerialize(proofHandle).exceptionally((e) -> {
                Log.e(TAG, "proofSerialize - Error: ", e);
                promise.reject("VcxException", e.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch(VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void proofDeserialize(String serializedProof, Promise promise) {
        Log.d(TAG, "proofDeserialize()");

        try {
            DisclosedProofApi.proofDeserialize(serializedProof).exceptionally((e)-> {
                Log.e(TAG, "proofDeserialize - Error: ", e);
                promise.reject("VcxException", e.getMessage());
                return -1;
            }).thenAccept(result -> {
                if (result != -1) {
                    BridgeUtils.resolveIfValid(promise, result);
                }
            });
        } catch(VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void proofReject(int proofHandle, int connectionHandle, Promise promise) {
        Log.d(TAG, "proofReject()");
        try {
            DisclosedProofApi.proofReject(proofHandle, connectionHandle).whenComplete((result, e) -> {
                if (e != null) {
                    Log.e(TAG, "proofReject - Error: ", e);
                    promise.reject("VcxException", e.getMessage());
                } else {
                    promise.resolve(0);
                }
            });
        } catch (VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void connectionRedirect(int redirectConnectionHandle, int connectionHandle, Promise promise) {
        Log.d(TAG, "connectionRedirect()");

        try {
            ConnectionApi.vcxConnectionRedirect(connectionHandle, redirectConnectionHandle).whenComplete((result, t) -> {
                if (t != null) {
                    Log.e(TAG, "vcxConnectionRedirect - Error: ", t);
                    promise.reject("VcxException", t.getMessage());
                } else {
                    promise.resolve(0);
                }
            });
        } catch(VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void getRedirectDetails(int connectionHandle, Promise promise) {
        Log.d(TAG, "getRedirectDetails()");

        try {
            ConnectionApi.vcxConnectionGetRedirectDetails(connectionHandle).exceptionally((e) -> {
                Log.e(TAG, "vcxConnectionGetRedirectDetails - Error: ", e);
                promise.reject("VcxException", e.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("VcxException", e.getMessage());
        }
    }

    @ReactMethod
    public void createWalletKey(int lengthOfKey, Promise promise) {
        try {
            SecureRandom random = new SecureRandom();
            byte bytes[] = new byte[lengthOfKey];
            random.nextBytes(bytes);
            promise.resolve(Base64.encodeToString(bytes, Base64.NO_WRAP));
        } catch(Exception e) {
            Log.e(TAG, "createWalletKey - Error: ", e);
            promise.reject("Exception", e.getMessage());
        }
    }

    @ReactMethod
    public void getLedgerFees(Promise promise) {
        Log.d(TAG, "getLedgerFees()");

        try {
            UtilsApi.getLedgerFees().exceptionally((e)-> {
                Log.e(TAG, "getLedgerFees - Error: ", e);
                promise.reject("VcxException", e.getMessage());
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch(VcxException e) {
            Log.e(TAG, "getLedgerFees - Error: ", e);
            promise.reject("Exception", e.getMessage());
        }
    }

    @Override
    public @Nullable
    Map<String, Object> getConstants() {
    HashMap<String, Object> constants = new HashMap<String, Object>();
      ActivityManager actManager = (ActivityManager) reactContext.getSystemService(Context.ACTIVITY_SERVICE);
      MemoryInfo memInfo = new ActivityManager.MemoryInfo();
      actManager.getMemoryInfo(memInfo);
      constants.put("totalMemory", memInfo.totalMem);
      return constants;
    }

    @ReactMethod
    public void getTxnAuthorAgreement(Promise promise) {
        try {
            // IndyApi.getTxnAuthorAgreement(submitterDid, data).exceptionally((e) -> {
            UtilsApi.getLedgerAuthorAgreement().exceptionally((e) -> {
                Log.e(TAG, "getLedgerAuthorAgreement - Error: ", e);
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("getTxnAuthorAgreement Exception", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void getAcceptanceMechanisms(String submitterDid, int timestamp, String version, Promise promise) {
        Long longtimestamp= new Long(timestamp);
        try {
            IndyApi.getAcceptanceMechanisms(submitterDid, longtimestamp, version).exceptionally((e) -> {
                Log.e(TAG, "getAcceptanceMechanisms - Error: ", e);
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("getAcceptanceMechanisms Exception", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void setActiveTxnAuthorAgreementMeta(String text, String version, String taaDigest, String mechanism, int timestamp, Promise promise) {
         Long longtimestamp= new Long(timestamp);
        try {
            UtilsApi.setActiveTxnAuthorAgreementMeta(text, version, taaDigest, mechanism, longtimestamp);
            promise.resolve("");
        } catch (VcxException e) {
            promise.reject("setActiveTxnAuthorAgreementMeta Exception", e.getMessage());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void appendTxnAuthorAgreement(String requestJson, String text, String version, String taaDigest, String mechanism, int timestamp, Promise promise) {
        Long longtimestamp= new Long(timestamp);
        try {
            IndyApi.appendTxnAuthorAgreement(requestJson, text, version, taaDigest, mechanism, longtimestamp).exceptionally((e) -> {
                Log.e(TAG, "appendTxnAuthorAgreement - Error: ", e);
                return null;
            }).thenAccept(result -> {
                BridgeUtils.resolveIfValid(promise, result);
            });
        } catch (VcxException e) {
            promise.reject("appendTxnAuthorAgreement Exception", e.getMessage());
            e.printStackTrace();
        }
    }
}
