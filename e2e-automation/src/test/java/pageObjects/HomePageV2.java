package test.java.pageObjects;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;

public interface HomePageV2 {
    public WebElement homeContainer(AppiumDriver driver) throws Exception;
    public WebElement homeHeader(AppiumDriver driver) throws Exception;
    public WebElement burgerMenuButton(AppiumDriver driver) throws Exception;
    public WebElement scanButton(AppiumDriver driver) throws Exception;
    public WebElement newMessage(AppiumDriver driver) throws Exception;
}
