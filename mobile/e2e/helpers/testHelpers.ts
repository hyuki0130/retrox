import { device, element, by, waitFor } from 'detox';

export const waitForElement = async (testID: string, timeout = 5000) => {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeout);
};

export const tapElement = async (testID: string) => {
  await element(by.id(testID)).tap();
};

export const waitAndTap = async (testID: string, timeout = 5000) => {
  await waitForElement(testID, timeout);
  await tapElement(testID);
};

export const reloadApp = async () => {
  await device.reloadReactNative();
};

export const launchApp = async (newInstance = true) => {
  await device.launchApp({ newInstance });
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const blockAdNetwork = async () => {
  await device.setURLBlacklist(['.*googlesyndication.*', '.*doubleclick.*', '.*googleads.*']);
};

export const unblockAdNetwork = async () => {
  await device.setURLBlacklist([]);
};
