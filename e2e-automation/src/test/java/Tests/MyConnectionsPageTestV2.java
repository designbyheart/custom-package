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
import test.java.pageObjects.MyConnectionsPageV2;
import test.java.utility.Config;
import test.java.utility.IntSetup;

public class MyConnectionsPageTestV2 extends IntSetup {

    Injector injector = Guice.createInjector(new AppInjector());
    AppUtils objAppUtils = injector.getInstance(AppUtils.class);
    HomePageV2 objHomePage = injector.getInstance(HomePageV2.class);
    MenuPageV2 objMenuPage = injector.getInstance(MenuPageV2.class);
    MyConnectionsPageV2 objMyConnectionsPage = injector.getInstance(MyConnectionsPageV2.class);

    @BeforeClass
    public void BeforeClassSetup() throws Exception {
        driver = IntSetup.configureDriver(Config.Device_Type, "connectMe");
        Thread.sleep(3000);
        objAppUtils.enterPincode(driver);
        objHomePage.burgerMenuButton(driver).click(); // go to Menu
        objMenuPage.myConnectionsButton(driver).click(); // go to My Connections
    }

    @Test
    public void checkElementsVisibility() throws Exception {
        objMyConnectionsPage.myConnectionsContainer(driver).isDisplayed();
        objMyConnectionsPage.myConnectionsHeader(driver).isDisplayed();
        objMyConnectionsPage.burgerMenuButton(driver).isDisplayed();
        objMyConnectionsPage.testConnection(driver).isDisplayed();
    }

    @Test(dependsOnMethods = "checkElementsVisibility")
    public void checkElementsAvailability() throws Exception {
        objMyConnectionsPage.testConnection(driver).click();
    }

    @AfterClass
    public void AfterClass() {
        driver.quit();
    }

}
