class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = process.env.NODE_ENV==="production"? "" :stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}