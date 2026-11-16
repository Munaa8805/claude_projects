export interface ActionResult<TData = undefined> {
  success: boolean;
  data?: TData;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}
