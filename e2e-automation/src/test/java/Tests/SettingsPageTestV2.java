package test.java.Tests;

import com.google.inject.Guice;
import com.google.inject.Injector;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.AndroidKeyCode;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.*;
import test.java.pageObjectsAndroid.PasscodePageAndroidV2;
import test.java.utility.Config;
import test.java.utility.IntSetup;

public class SettingsPageTestV2 extends IntSetup {

    Injector injector = Guice.createInjector(new AppInjector());
    AppUtils objAppUtils = injector.getInstance(AppUtils.class);
    HomePageV2 objHomePage = injector.getInstance(HomePageV2.class);
    MenuPageV2 objMenuPage = injector.getInstance(MenuPageV2.class);
    SettingsPageV2 objSettingsPage = injector.getInstance(SettingsPageV2.class);
    BackupPageV2 objBackupPage = injector.getInstance(BackupPageV2.class);
    BiometricsPageV2 objBiometricsPage = injector.getInstance(BiometricsPageV2.class);
    PasscodePageV2 objPasscodePage = injector.getInstance(PasscodePageV2.class);
    ChatPageV2 objChatPage = injector.getInstance(ChatPageV2.class);
    AboutPageV2 objAboutPage = injector.getInstance(AboutPageV2.class);
    OnfidoPageV2 objOnfidoPage = injector.getInstance(OnfidoPageV2.class);

    @BeforeClass
    public void BeforeClassSetup() throws Exception {
        driver = IntSetup.configureDriver(Config.Device_Type, "connectMe");
//        Thread.sleep(5000);
        objAppUtils.enterPincode(driver);
        objHomePage.burgerMenuButton(driver).click(); // go to Menu
        objMenuPage.settingsButton(driver).click(); // go to Settings
    }

    @Test
    public void checkElementsVisibility() throws Exception {
        objSettingsPage.settingsContainer(driver).isDisplayed();
        objSettingsPage.settingsHeader(driver).isDisplayed();
        objSettingsPage.burgerMenuButton(driver).isDisplayed();
        objSettingsPage.createBackupButton(driver).isDisplayed();
        objSettingsPage.biometricsButton(driver).isDisplayed();
        objSettingsPage.passcodeButton(driver).isDisplayed();
        objSettingsPage.chatButton(driver).isDisplayed();
        objSettingsPage.aboutButton(driver).isDisplayed();
        objSettingsPage.onfidoButton(driver).isDisplayed();
    }

    @Test(dependsOnMethods = "checkElementsVisibility")
    public void checkElementsAvailability() throws Exception {
        objSettingsPage.createBackupButton(driver).click();
        objBackupPage.closeButton(driver).click();
        objSettingsPage.biometricsButton(driver).click();
        objBiometricsPage.cancelButton(driver).click();
        objSettingsPage.passcodeButton(driver).click();
        objPasscodePage.backArrow(driver).click();
        objSettingsPage.chatButton(driver).click();
        objChatPage.backArrow(driver).click();
        objSettingsPage.aboutButton(driver).click();
        objAboutPage.backArrow(driver).click();
        objSettingsPage.onfidoButton(driver).click();
        objOnfidoPage.backArrow(driver).click();
    }

    @AfterClass
    public void AfterClass() {
        driver.quit();
    }

}
