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
import test.java.pageObjects.HomePageV2;
import test.java.pageObjects.MenuPageV2;
import test.java.utility.Config;
import test.java.utility.IntSetup;

public class MenuPageTestV2 extends IntSetup {

    Injector injector = Guice.createInjector(new AppInjector());
    AppUtils objAppUtils = injector.getInstance(AppUtils.class);
    HomePageV2 objHomePage = injector.getInstance(HomePageV2.class);
    MenuPageV2 objMenuPage = injector.getInstance(MenuPageV2.class);

    @BeforeClass
    public void BeforeClassSetup() throws Exception {
        driver = IntSetup.configureDriver(Config.Device_Type, "connectMe");
        Thread.sleep(3000);
        objAppUtils.enterPincode(driver);
        objHomePage.burgerMenuButton(driver).click(); // go to Menu
    }

    @Test
    public void checkElementsVisibility() throws Exception {
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

    @Test(dependsOnMethods = "checkElementsVisibility")
    public void checkElementsAvailability() throws Exception {
        objMenuPage.userAvatar(driver).click();
        try {
            objMenuPage.menuAllowButton(driver).click();
        }
        catch (NoSuchElementException e) {
            System.out.println("Permissions already have been granted!");
        }
        finally {
            Thread.sleep(1000);
            ((AndroidDriver) driver).pressKeyCode(AndroidKeyCode.BACK);
        }
        objMenuPage.homeButton(driver).click();
        objMenuPage.myConnectionsButton(driver).click();
        objHomePage.burgerMenuButton(driver).click();
        objMenuPage.settingsButton(driver).isDisplayed();
    }

    @AfterClass
    public void AfterClass() {
        driver.quit();
    }
}
