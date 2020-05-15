package test.java.Tests;

import java.util.ArrayList;
import java.util.List;
import org.testng.TestNG;
import org.testng.annotations.Test;

public class DeviceFarmTests {
	@Test
	public void connectMeTests() {
		// it doesn't work due to permission denied errors and it has the same CM crash like in testng.xml run
		TestNG runner = new TestNG();
		runner.setOutputDirectory(System.getenv("WORKING_DIRECTORY")); // uses the custom artifacts to get the results
		runner.setPreserveOrder(true);
		List<String> suitefiles = new ArrayList<String>();
		runner.setTestClasses(new Class[] { ConnectionTest.class, HomePageTestV2.class });
		runner.run();
	}
}
