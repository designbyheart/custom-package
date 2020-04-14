package test.java.pageObjects;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;

public interface BackupPageV2 {
    public WebElement recoveryHeader(AppiumDriver driver) throws Exception;
    public WebElement recoveryPhrase(AppiumDriver driver) throws Exception;
    public WebElement continueButton(AppiumDriver driver) throws Exception;
    public WebElement closeButton(AppiumDriver driver) throws Exception;
}
