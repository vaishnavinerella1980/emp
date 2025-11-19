class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(message = 'Error occurred', statusCode = 500, errors = null) {
    return {
      success: false,
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  static paginated(data, total, page, limit, message = 'Data retrieved successfully') {
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      statusCode: 200,
      message,
      data,
      pagination: {
        total_records: total,
        total_pages: totalPages,
        current_page: page,
        records_per_page: limit,
        has_next_page: page < totalPages,
        has_prev_page: page > 1
      },
      timestamp: new Date().toISOString()
    };
  }
}

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  ApiResponse,
  asyncHandler
};