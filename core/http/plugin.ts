import { RawResponse } from "./create";

export const retrieveData = () => {
  return {
    response: (response: RawResponse) =>
      response.config.useRawResponse ? response : response.data,
  };
};
