package test.java.Tests;

import com.google.inject.Guice;
import com.google.inject.Injector;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.AndroidKeyCode;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
import test.java.funcModules.ConnectionModules;
import test.java.funcModules.LockModules;
import test.java.pageObjects.HomePageV2;
import test.java.pageObjects.RestorePageV2;
import test.java.utility.Config;
import test.java.utility.IntSetup;

public class RestoreTestV2 extends IntSetup {
    Injector injector = Guice.createInjector(new AppInjector());
    ConnectionModules objConnectionModules = injector.getInstance(ConnectionModules.class);
    LockModules objLockModules = injector.getInstance(LockModules.class);
    RestorePageV2 objRestorePage = injector.getInstance(RestorePageV2.class);
    AppUtils objAppUtlis = injector.getInstance(AppUtils.class);
    HomePageV2 objHomePage = injector.getInstance(HomePageV2.class);

    @BeforeMethod
    public void BeforeMethodSetup() throws Exception {
        driver = IntSetup.configureDriver(Config.Device_Type, "connectMe");
        Thread.sleep(3000);
        driver.removeApp("me.connect");
    }

    @Test
    public void checkLocalRestore() throws Exception {
        ctx.getContext();
        objConnectionModules.installApp(driver, "");
        objLockModules.navigateRestore(driver,"android");
        objRestorePage.restoreFromBackupButton(driver).click();
        objRestorePage.restoreHeader(driver).isDisplayed();
        objRestorePage.restoreFromDeviceButton(driver).click();
        objRestorePage.zipFileSelector(driver, ctx.backupFileName).click();
        objRestorePage.recoveryPhraseBoxLocal(driver).sendKeys(ctx.recoveryPhrase);
        AndroidDriver androidDriver = (AndroidDriver) driver;
        androidDriver.pressKeyCode(AndroidKeyCode.KEYCODE_ENTER);
        objRestorePage.enterPasscodeMessage(driver).isDisplayed();
        objAppUtlis.enterPincode(driver);
        objHomePage.homeHeader(driver).isDisplayed();
    }

    @Test(dependsOnMethods = "checkLocalRestore", enabled = false) // this feature is switched off
    public void checkCloudRestore() throws Exception {
        ctx.getContext();
        objConnectionModules.installApp(driver, "");
        objLockModules.navigateRestore(driver,"android");
        objRestorePage.restoreFromBackupButton(driver).click();
        objRestorePage.restoreHeader(driver).isDisplayed();
        objRestorePage.restoreFromCloudButton(driver).click();
        objRestorePage.recoveryPhraseBoxCloud(driver).sendKeys(ctx.recoveryPhrase);
        AndroidDriver androidDriver = (AndroidDriver) driver;
        androidDriver.pressKeyCode(AndroidKeyCode.KEYCODE_ENTER);
        // FIXME I got `Recovery phrase doesn't match here so it looks like env should be switched in the beginning`
    }

    @AfterClass
    public void AfterClass() {
        driver.quit();
    }

}
