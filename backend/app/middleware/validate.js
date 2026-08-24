const validate = (schema, source = 'body') => (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
        return next(result.error);
    }
    // El body queda normalizado/limpio (se eliminan claves desconocidas)
    req[source] = result.data;
    next();
};

module.exports = validate;