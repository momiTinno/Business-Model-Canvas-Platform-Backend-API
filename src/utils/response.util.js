export class ResponseUtil {
  success = (data) => ({ success: true, data });
  error = (message, code) => ({ success: false, message, code });
}
export const responseUtil = new ResponseUtil();
