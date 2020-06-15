package test.java.Tests;

import com.google.inject.Guice;
import com.google.inject.Injector;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.AndroidKeyCode;
import org.openqa.selenium.NoSuchElementException;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
import test.java.funcModules.ConnectionModules;
import test.java.funcModules.LockModules;
import test.java.funcModules.SwitchEnvModules;
import test.java.pageObjects.*;
import test.java.utility.Config;
import test.java.utility.IntSetup;

public class DeviceFarmSessionTest extends IntSetup {

    Injector injector = Guice.createInjector(new AppInjector());
    LockModules objLockModules = injector.getInstance(LockModules.class);
    AppUtils objAppUtlis = injector.getInstance(AppUtils.class);
    HomePageV2 objHomePage = injector.getInstance(HomePageV2.class);
    ScannerPageV2 objScannerPage = injector.getInstance(ScannerPageV2.class);
    MenuPageV2 objMenuPage = injector.getInstance(MenuPageV2.class);
    MyConnectionsPageV2 objMyConnectionsPage = injector.getInstance(MyConnectionsPageV2.class);
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
    }

    @Test
    public void pincodeSetupTest() throws Exception {
        objLockModules.navigateSetupPincode(driver);
        objLockModules.pinCodeSetup(driver);
    }

    @Test(dependsOnMethods = "pincodeSetupTest")
    public void checkMenuElementsVisibility() throws Exception {
        objHomePage.burgerMenuButton(driver).click();

        objMenuPage.menuContainer(driver).isDisplayed();
        objMenuPage.connectMeBanner(driver).isDisplayed();
        objMenuPage.userAvatar(driver).isDisplayed();
        objMenuPage.homeButton(driver).isDisplayed();
        objMenuPage.myConnectionsButton(driver).isDisplayed();
        objMenuPage.settingsButton(driver).isDisplayed();
        objMenuPage.connectMeLogo(driver).isDisplayed();
        objMenuPage.builtByFooter(driver).isDisplayed();
        objMenuPage.versionFooter(driver).isDisplayed();
    }

    @Test(dependsOnMethods = "checkMenuElementsVisibility")
    public void checkMenuElementsAvailability() throws Exception {
//        objMenuPage.userAvatar(driver).click();
//        try {
//            objMenuPage.okButton(driver).click();
//            objMenuPage.menuAllowButton(driver).click();
//        }
//        catch (NoSuchElementException e) {
//            System.out.println("Permissions already have been granted!");
//        }
//        finally {
//            Thread.sleep(1000);
//            ((AndroidDriver) driver).pressKeyCode(AndroidKeyCode.BACK);
//        }
        objMenuPage.homeButton(driver).click();
        objMenuPage.myConnectionsButton(driver).click();
        objHomePage.burgerMenuButton(driver).click();
        objMenuPage.settingsButton(driver).click();
    }

    @Test(dependsOnMethods = "checkMenuElementsAvailability")
    public void checkHomeElementsVisibility() throws Exception {
        objHomePage.burgerMenuButton(driver).click();
        objMenuPage.homeButton(driver).click();

        objHomePage.homeContainer(driver).isDisplayed();
        objHomePage.homeHeader(driver).isDisplayed();
        objHomePage.burgerMenuButton(driver).isDisplayed();
        objHomePage.scanButton(driver).isDisplayed();
    }

    @Test(dependsOnMethods = "checkHomeElementsVisibility")
    public void checkHomeElementsAvailability() throws Exception {
        objHomePage.burgerMenuButton(driver).click();
//        objHomePage.scanButton(driver).click(); // FIXME replace it with swipe back
//        objHomePage.scanButton(driver).click();
//        try {
//            objScannerPage.scannerAllowButton(driver).click();
//        }
//        catch (NoSuchElementException e) {
//            System.out.println("Permissions already have been granted!");
//        }
//        finally {
//            Thread.sleep(1000);
//            objScannerPage.scannerCloseButton(driver).click();
//        }
    }

    @Test(dependsOnMethods = "checkHomeElementsAvailability")
    public void checkConnectionsElementsVisibility() throws Exception {
        objMenuPage.myConnectionsButton(driver).click();

        objMyConnectionsPage.myConnectionsContainer(driver).isDisplayed();
        objMyConnectionsPage.myConnectionsHeader(driver).isDisplayed();
        objMyConnectionsPage.burgerMenuButton(driver).isDisplayed();
//        objMyConnectionsPage.testConnection(driver).isDisplayed();
    }

    @Test(dependsOnMethods = "checkConnectionsElementsVisibility")
    public void checkConnectionsElementsAvailability() throws Exception {
//        objMyConnectionsPage.testConnection(driver).click();
    }

    @Test(dependsOnMethods = "checkConnectionsElementsAvailability")
    public void checkSettingsElementsVisibility() throws Exception {
        objHomePage.burgerMenuButton(driver).click();
        objMenuPage.settingsButton(driver).click();

        objSettingsPage.settingsContainer(driver).isDisplayed();
        objSettingsPage.settingsHeader(driver).isDisplayed();
        objSettingsPage.burgerMenuButton(driver).isDisplayed();
        // objSettingsPage.createBackupButton(driver).isDisplayed();
        objSettingsPage.biometricsButton(driver).isDisplayed();
        objSettingsPage.passcodeButton(driver).isDisplayed();
        objSettingsPage.chatButton(driver).isDisplayed();
        objSettingsPage.aboutButton(driver).isDisplayed();
        objSettingsPage.onfidoButton(driver).isDisplayed();
    }

    @Test(dependsOnMethods = "checkSettingsElementsVisibility")
    public void checkSettingsElementsAvailability() throws Exception {
//        objSettingsPage.createBackupButton(driver).click();
//        objBackupPage.closeButton(driver).click();
        objSettingsPage.biometricsButton(driver).click();
        objBiometricsPage.okButton(driver).click();
        objSettingsPage.passcodeButton(driver).click();
        objPasscodePage.backArrow(driver).click();
//        // CM-2616
//        objSettingsPage.chatButton(driver).click();
//        objChatPage.backArrow(driver).click();
        objSettingsPage.aboutButton(driver).click();
        objAboutPage.backArrow(driver).click();
        objSettingsPage.onfidoButton(driver).click();
        ((AndroidDriver) driver).pressKeyCode(AndroidKeyCode.BACK);
    }

    @AfterClass
    public void AfterClass() throws Exception{
        Thread.sleep(1000);
        driver.quit();
    }

}
