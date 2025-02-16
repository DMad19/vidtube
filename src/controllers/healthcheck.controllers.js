import { asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/apiResponse.js";

const healthCheck = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new APIResponse("200", "OK", "health check passed"));
});

export { healthCheck };
