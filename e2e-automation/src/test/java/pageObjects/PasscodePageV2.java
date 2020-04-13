package test.java.pageObjects;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;

public interface PasscodePageV2 {
    public WebElement passcodeContainer(AppiumDriver driver) throws Exception;
    public WebElement passcodeHeader(AppiumDriver driver) throws Exception;
    public WebElement backArrow(AppiumDriver driver) throws Exception;
}
