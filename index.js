class Query {
    copy() {
        let copy = this.partitionKey ? Query.GetKeyedQuery(this.partitionKey) :
                               Query.GetQuery(this.orderBy);

        copy.max = this.max;
        copy.isOrdered = this.isOrdered;
        copy.index = this.index;
        return copy;
    }

    limit(limit) {
        let query = this.copy();
        query.max = Math.min(this.max || limit, limit);
        return query;
    }

    order(inOrder = true) {
        let query = this.copy();
        query.isOrdered = inOrder;
        return query;
    }

    withIndex(index) {
        let query = this.copy();
        query.index = index;
        return query;
    }

    static GetQuery(orderBy) {
        if (orderBy === undefined) {
            throw new Error("Invalid orderBy");
        }

        let query = new Query();
        query.orderBy = orderBy;
        return query;
    }

    static GetKeyedQuery(partitionKey) {
        if (partitionKey === undefined) {
            throw new Error("Invalid key");
        }

        let query = new Query();
        query.partitionKey = partitionKey;
        return query;
    }
}

function buildQuery(ctx) {
    let query = (ctx.query["key"]) ?
        Query.GetKeyedQuery(ctx.query["key"])
        : Query.GetQuery(ctx.query["orderby"]);

    if (ctx.query["order"] !== undefined) {
        query = query.order(ctx.query["order"].toLowerCase() === "true");
    }

    if (ctx.query["top"] !== undefined) {
        query = query.limit(parseInt(ctx.query["top"]));
    }

    if (ctx.query['index'] !== undefined) {
        query = query.withIndex(ctx.query["index"]);
    }

    return query;
}

module.exports = () => async (ctx, next) => {
    if (ctx.query["key"] || ctx.query["orderby"]) {
        ctx.dbQuery = buildQuery(ctx);
    }

    await next();
}

module.exports.Query = Query;
