package test.java.pageObjects;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;

public interface BiometricsPageV2 {
    public WebElement cancelButton(AppiumDriver driver) throws Exception;
    public WebElement okButton(AppiumDriver driver) throws Exception;
}
