/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface GameDto {
  id?: string;
  roomId?: string;
  status?: string;
  /** @format int32 */
  currentRound?: number;
  /** @format int32 */
  totalRounds?: number;
  /** @format int32 */
  roundTimeSeconds?: number;
  /** @format date-time */
  startTime?: string;
  /** @format date-time */
  roundStartTime?: string | null;
  /** @format date-time */
  endTime?: string | null;
  currentDrawerId?: string | null;
  currentWordId?: string | null;
  scores?: ScoreDto[];
}

export interface ScoreDto {
  userId?: string;
  username?: string;
  /** @format int32 */
  points?: number;
  /** @format int32 */
  drawingPoints?: number;
  /** @format int32 */
  guessingPoints?: number;
}

export interface CreateGameRequest {
  roomId?: string;
  /** @format int32 */
  rounds?: number;
  /** @format int32 */
  timePerRound?: number;
}

export interface AssignDrawerRequest {
  userId?: string;
}

export interface WordDto {
  id?: string;
  text?: string;
  category?: string | null;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:5295",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Pictionary Game API
 * @version v1
 * @baseUrl http://localhost:5295
 *
 * REST API for the Pictionary game
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags GameOrchestration
     * @name GameOrchestrationCreateGame
     * @request POST:/api/games
     * @secure
     */
    gameOrchestrationCreateGame: (
      data: CreateGameRequest,
      params: RequestParams = {},
    ) =>
      this.request<GameDto, any>({
        path: `/api/games`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags GameOrchestration
     * @name GameOrchestrationStartGame
     * @request PUT:/api/games/{gameId}/start
     * @secure
     */
    gameOrchestrationStartGame: (gameId: string, params: RequestParams = {}) =>
      this.request<GameDto, any>({
        path: `/api/games/${gameId}/start`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags GameOrchestration
     * @name GameOrchestrationStartRound
     * @request PUT:/api/games/{gameId}/rounds/start
     * @secure
     */
    gameOrchestrationStartRound: (gameId: string, params: RequestParams = {}) =>
      this.request<GameDto, any>({
        path: `/api/games/${gameId}/rounds/start`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags GameOrchestration
     * @name GameOrchestrationEndRound
     * @request PUT:/api/games/{gameId}/rounds/end
     * @secure
     */
    gameOrchestrationEndRound: (gameId: string, params: RequestParams = {}) =>
      this.request<GameDto, any>({
        path: `/api/games/${gameId}/rounds/end`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags GameOrchestration
     * @name GameOrchestrationEndGame
     * @request PUT:/api/games/{gameId}/end
     * @secure
     */
    gameOrchestrationEndGame: (gameId: string, params: RequestParams = {}) =>
      this.request<GameDto, any>({
        path: `/api/games/${gameId}/end`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags GameOrchestration
     * @name GameOrchestrationAssignDrawer
     * @request PUT:/api/games/{gameId}/drawer
     * @secure
     */
    gameOrchestrationAssignDrawer: (
      gameId: string,
      data: AssignDrawerRequest,
      params: RequestParams = {},
    ) =>
      this.request<File, any>({
        path: `/api/games/${gameId}/drawer`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags GameOrchestration
     * @name GameOrchestrationSelectWord
     * @request GET:/api/games/{gameId}/word
     * @secure
     */
    gameOrchestrationSelectWord: (
      gameId: string,
      query?: {
        category?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<WordDto, any>({
        path: `/api/games/${gameId}/word`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Test
     * @name TestGet
     * @request GET:/api/Test
     */
    testGet: (params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/api/Test`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
