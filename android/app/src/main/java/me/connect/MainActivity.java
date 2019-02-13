package me.connect;

import com.facebook.react.ReactActivity;

import android.os.Bundle;
import android.provider.Settings;
import android.content.pm.PackageManager;
import android.os.Build;

import org.devio.rn.splashscreen.SplashScreen;
import io.branch.rnbranch.*;
import me.connect.rnindy.LogFileObserver;
import me.connect.rnindy.RNIndyStaticData;

import android.content.Intent;

import android.content.ContextWrapper;
import android.support.v4.app.ActivityCompat;
import android.system.Os;
import android.widget.Toast;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintStream;

public class MainActivity extends ReactActivity {
//        implements ActivityCompat.OnRequestPermissionsResultCallback {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */

    @Override
    protected void onStart() {
        super.onStart();
        try {
          ContextWrapper c = new ContextWrapper(this);
          Os.setenv("EXTERNAL_STORAGE", c.getFilesDir().toString(), true);
          // un-comment to enable logging in vcx, indy & sovtoken libraries
          // Os.setenv("RUST_LOG", "TRACE", true);
        } catch(Exception e){
          e.printStackTrace();
        }
        RNBranchModule.initSession(getIntent().getData(), this);
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    @Override
    protected String getMainComponentName() {
        return "ConnectMe";
    }

    @Override
   protected void onCreate(Bundle savedInstanceState) {
       super.onCreate(savedInstanceState);
       SplashScreen.show(this);
   }


//   @Override
//   public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
//       switch (requestCode) {
//           case RNIndyStaticData.REQUEST_WRITE_EXTERNAL_STORAGE: {
//               if (grantResults.length == 1 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
//                   // create the log file if it does not exist
//                   try {
//                       if(! new File(RNIndyStaticData.LOG_FILE_PATH).exists()) {
//                           new FileWriter(RNIndyStaticData.LOG_FILE_PATH).close();
//                       }
//                   } catch(IOException ex) {
//                       ex.printStackTrace();
//                   }
//
//                   // Now monitor the logFile and empty it out when it's size is
//                   // larger than MAX_ALLOWED_FILE_BYTES
//                   RNIndyStaticData.logFileObserver = new LogFileObserver(RNIndyStaticData.LOG_FILE_PATH, RNIndyStaticData.MAX_ALLOWED_FILE_BYTES);
//                   RNIndyStaticData.logFileObserver.startWatching();
//
//                   Toast.makeText(this,
//                           "Logging Turned On",
//                           Toast.LENGTH_SHORT).show();
//               } else {
//                   Toast.makeText(this,
//                           "Logging Turned Off",
//                           Toast.LENGTH_SHORT).show();
//               }
//               return;
//           }
//       }
//       super.onRequestPermissionsResult(requestCode, permissions, grantResults);
//   }
}
