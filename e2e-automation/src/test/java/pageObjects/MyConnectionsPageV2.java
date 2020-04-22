package test.java.pageObjects;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;

public interface MyConnectionsPageV2 {
    public WebElement myConnectionsContainer(AppiumDriver driver) throws Exception;
    public WebElement myConnectionsHeader(AppiumDriver driver) throws Exception;
    public WebElement burgerMenuButton(AppiumDriver driver) throws Exception;
    public WebElement newConnection(AppiumDriver driver) throws Exception;
    public WebElement testConnection(AppiumDriver driver) throws Exception;
    public WebElement viewButton(AppiumDriver driver) throws Exception;
}
