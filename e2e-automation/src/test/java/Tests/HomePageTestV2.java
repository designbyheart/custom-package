package test.java.Tests;

import com.google.inject.Guice;
import com.google.inject.Injector;
import org.openqa.selenium.NoSuchElementException;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
import test.java.pageObjects.HomePageV2;
import test.java.pageObjects.ScannerPageV2;
import test.java.utility.Config;
import test.java.utility.IntSetup;

public class HomePageTestV2 extends IntSetup {

    Injector injector = Guice.createInjector(new AppInjector());
    AppUtils objAppUtils = injector.getInstance(AppUtils.class);
    HomePageV2 objHomePage = injector.getInstance(HomePageV2.class);
    ScannerPageV2 objScannerPage = injector.getInstance(ScannerPageV2.class);

    @BeforeClass
    public void BeforeClassSetup() throws Exception {
        driver = IntSetup.configureDriver(Config.Device_Type, "connectMe");
        Thread.sleep(3000);
        objAppUtils.enterPincode(driver);
    }

    @Test
    public void checkElementsVisibility() throws Exception {
        objHomePage.homeContainer(driver).isDisplayed();
        objHomePage.homeHeader(driver).isDisplayed();
        objHomePage.burgerMenuButton(driver).isDisplayed();
        objHomePage.scanButton(driver).isDisplayed();
    }

    @Test(dependsOnMethods = "checkElementsVisibility")
    public void checkElementsAvailability() throws Exception {
        objHomePage.burgerMenuButton(driver).click();
        objHomePage.scanButton(driver).click(); // FIXME replace it with swipe back
        objHomePage.scanButton(driver).click();
        try {
            objScannerPage.scannerAllowButton(driver).click();
        }
        catch (NoSuchElementException e) {
            System.out.println("Permissions already have been granted!");
        }
        finally {
            Thread.sleep(1000);
            objScannerPage.scannerCloseButton(driver).click();
        }
    }

    @AfterClass
    public void AfterClass() {
        driver.quit();
    }

}
