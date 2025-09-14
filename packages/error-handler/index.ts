
export class AppError extends Error {
    
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details ?: any;

    constructor(message:string,statusCode:number,isOperational:true,details?:any){
      
        super(message);
        this.statusCode = statusCode; 
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this);


    }
}


// Specific error types for common scenarios
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404,true);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Invalid request data", details?: any ) {
    super(message, 400, true, details);
  }
}



export class AuthError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(message, 403,true);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429,true);
  }
} 

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed",details?: any) {
    super(message, 500, true,details); // Not operational - this is a bug!
  }
}
