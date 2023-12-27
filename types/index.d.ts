declare namespace Express {
  export interface Application {
    getRuntimeConfig: () => any;
  }
  export interface Request {
    $context: any;
  }
}

interface Window {
  __SSR__: boolean;
  rawData: any;
  __wxjs_environment: string;
  stores: any;
  // 反序列化好的数据
  __INITIAL_PROPS__: any;
}
