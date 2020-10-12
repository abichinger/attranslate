import { TMatcher } from "../matchers/matcher-definitions";

export interface TResult {
  key: string;
  translated: string;
}

export interface TString {
  key: string;
  value: string;
}

export interface TServiceArgs {
  strings: TString[];
  srcLng: string;
  targetLng: string;
  serviceConfig: string;
  interpolationMatcher?: TMatcher;
}

export interface TService {
  translateStrings: (args: TServiceArgs) => Promise<TResult[]>;
}

export type TServiceType = keyof typeof serviceMap;

export function getTServiceList(): TServiceType[] {
  return Object.keys(serviceMap) as TServiceType[];
}

const serviceMap = {
  "google-translate": null,
  deepl: null,
  azure: null,
  manual: null,
};

export function injectFakeService(serviceName: string, service: TService) {
  fakeServiceMap[serviceName] = service;
}

const fakeServiceMap: Record<string, TService> = {};

export async function instantiateTService(
  service: TServiceType
): Promise<TService> {
  const fakeService = fakeServiceMap[service];
  if (fakeService) {
    return fakeService;
  }
  /**
   * To gain a reasonable launch-performance, we import services dynamically (instead of static imports).
   */
  switch (service) {
    case "azure":
      return new (await import("./azure-translator")).AzureTranslator();
    case "deepl":
      return new (await import("./deepl")).DeepL();
    case "google-translate":
      return new (await import("./google-translate")).GoogleTranslate();
    case "manual":
      return new (await import("./manual")).ManualTranslation();
  }
}
