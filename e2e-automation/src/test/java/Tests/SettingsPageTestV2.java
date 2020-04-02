package test.java.Tests;

import com.google.inject.Guice;
import com.google.inject.Injector;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
import test.java.pageObjects.HomePageV2;
import test.java.pageObjects.MenuPageV2;
import test.java.pageObjects.SettingsPageV2;
import test.java.utility.Config;
import test.java.utility.IntSetup;

public class SettingsPageTestV2 extends IntSetup {

    Injector injector = Guice.createInjector(new AppInjector());
    AppUtils objAppUtils = injector.getInstance(AppUtils.class);
    HomePageV2 objHomePage = injector.getInstance(HomePageV2.class);
    MenuPageV2 objMenuPage = injector.getInstance(MenuPageV2.class);
    SettingsPageV2 objSettingsPage = injector.getInstance(SettingsPageV2.class);

    @BeforeClass
    public void BeforeClassSetup() throws Exception {
        driver = IntSetup.configureDriver(Config.Device_Type, "connectMe");
        Thread.sleep(3000);
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
    public void checkElementsAvailability() throws Exception {}

    @AfterClass
    public void AfterClass() {
        driver.quit();
    }

}
