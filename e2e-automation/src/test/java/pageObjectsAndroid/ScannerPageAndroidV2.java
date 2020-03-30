package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.ScannerPageV2;

public class ScannerPageAndroidV2 implements ScannerPageV2 {

    public WebElement scannerAllowButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(driver, "//*[@class=\"android.widget.Button\"][2]", "Allow Button");
    }


    public WebElement scannerCloseButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(driver, "//android.view.ViewGroup[@content-desc=\"close-qr-scanner-container\"]", "Close Scanner Button");
    }
}
