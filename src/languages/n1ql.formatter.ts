import Formatter from '../core/Formatter';
import Tokenizer from '../core/Tokenizer';
import type { StringPatternType } from '../core/regexFactory';
import { dedupe } from '../utils';

// TODO: split this into object with function categories
/**
 * Priority 5 (last)
 * Full list of reserved functions
 * distinct from Keywords due to interaction with parentheses
 */
// https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/functions.html
const reservedFunctions = [
  'ABORT',
  'ABS',
  'ACOS',
  'ADVISOR',
  'ARRAY_AGG',
  'ARRAY_AGG',
  'ARRAY_APPEND',
  'ARRAY_AVG',
  'ARRAY_BINARY_SEARCH',
  'ARRAY_CONCAT',
  'ARRAY_CONTAINS',
  'ARRAY_COUNT',
  'ARRAY_DISTINCT',
  'ARRAY_EXCEPT',
  'ARRAY_FLATTEN',
  'ARRAY_IFNULL',
  'ARRAY_INSERT',
  'ARRAY_INTERSECT',
  'ARRAY_LENGTH',
  'ARRAY_MAX',
  'ARRAY_MIN',
  'ARRAY_MOVE',
  'ARRAY_POSITION',
  'ARRAY_PREPEND',
  'ARRAY_PUT',
  'ARRAY_RANGE',
  'ARRAY_REMOVE',
  'ARRAY_REPEAT',
  'ARRAY_REPLACE',
  'ARRAY_REVERSE',
  'ARRAY_SORT',
  'ARRAY_STAR',
  'ARRAY_SUM',
  'ARRAY_SYMDIFF',
  'ARRAY_SYMDIFF1',
  'ARRAY_SYMDIFFN',
  'ARRAY_UNION',
  'ASIN',
  'ATAN',
  'ATAN2',
  'AVG',
  'BASE64',
  'BASE64_DECODE',
  'BASE64_ENCODE',
  'BITAND ',
  'BITCLEAR ',
  'BITNOT ',
  'BITOR ',
  'BITSET ',
  'BITSHIFT ',
  'BITTEST ',
  'BITXOR ',
  'CEIL',
  'CLOCK_LOCAL',
  'CLOCK_MILLIS',
  'CLOCK_STR',
  'CLOCK_TZ',
  'CLOCK_UTC',
  'COALESCE',
  'CONCAT',
  'CONCAT2',
  'CONTAINS',
  'CONTAINS_TOKEN',
  'CONTAINS_TOKEN_LIKE',
  'CONTAINS_TOKEN_REGEXP',
  'COS',
  'COUNT',
  'COUNT',
  'COUNTN',
  'CUME_DIST',
  'CURL',
  'DATE_ADD_MILLIS',
  'DATE_ADD_STR',
  'DATE_DIFF_MILLIS',
  'DATE_DIFF_STR',
  'DATE_FORMAT_STR',
  'DATE_PART_MILLIS',
  'DATE_PART_STR',
  'DATE_RANGE_MILLIS',
  'DATE_RANGE_STR',
  'DATE_TRUNC_MILLIS',
  'DATE_TRUNC_STR',
  'DECODE',
  'DECODE_JSON',
  'DEGREES',
  'DENSE_RANK',
  'DURATION_TO_STR',
  // 'E',
  'ENCODED_SIZE',
  'ENCODE_JSON',
  'EXP',
  'FIRST_VALUE',
  'FLOOR',
  'GREATEST',
  'HAS_TOKEN',
  'IFINF',
  'IFMISSING',
  'IFMISSINGORNULL',
  'IFNAN',
  'IFNANORINF',
  'IFNULL',
  'INITCAP',
  'ISARRAY',
  'ISATOM',
  'ISBITSET',
  'ISBOOLEAN',
  'ISNUMBER',
  'ISOBJECT',
  'ISSTRING',
  'LAG',
  'LAST_VALUE',
  'LEAD',
  'LEAST',
  'LENGTH',
  'LN',
  'LOG',
  'LOWER',
  'LTRIM',
  'MAX',
  'MEAN',
  'MEDIAN',
  'META',
  'MILLIS',
  'MILLIS_TO_LOCAL',
  'MILLIS_TO_STR',
  'MILLIS_TO_TZ',
  'MILLIS_TO_UTC',
  'MILLIS_TO_ZONE_NAME',
  'MIN',
  'MISSINGIF',
  'NANIF',
  'NEGINFIF',
  'NOW_LOCAL',
  'NOW_MILLIS',
  'NOW_STR',
  'NOW_TZ',
  'NOW_UTC',
  'NTH_VALUE',
  'NTILE',
  'NULLIF',
  'NVL',
  'NVL2',
  'OBJECT_ADD',
  'OBJECT_CONCAT',
  'OBJECT_INNER_PAIRS',
  'OBJECT_INNER_VALUES',
  'OBJECT_LENGTH',
  'OBJECT_NAMES',
  'OBJECT_PAIRS',
  'OBJECT_PUT',
  'OBJECT_REMOVE',
  'OBJECT_RENAME',
  'OBJECT_REPLACE',
  'OBJECT_UNWRAP',
  'OBJECT_VALUES',
  'PAIRS',
  'PERCENT_RANK',
  'PI',
  'POLY_LENGTH',
  'POSINFIF',
  'POSITION',
  'POWER',
  'RADIANS',
  'RANDOM',
  'RANK',
  'RATIO_TO_REPORT',
  'REGEXP_CONTAINS',
  'REGEXP_LIKE',
  'REGEXP_MATCHES',
  'REGEXP_POSITION',
  'REGEXP_REPLACE',
  'REGEXP_SPLIT',
  'REGEX_CONTAINS',
  'REGEX_LIKE',
  'REGEX_MATCHES',
  'REGEX_POSITION',
  'REGEX_REPLACE',
  'REGEX_SPLIT',
  'REPEAT',
  'REPLACE',
  'REVERSE',
  'ROUND',
  'ROW_NUMBER',
  'RTRIM',
  'SEARCH',
  'SEARCH_META',
  'SEARCH_SCORE',
  'SIGN',
  'SIN',
  'SPLIT',
  'SQRT',
  'STDDEV',
  'STDDEV_POP',
  'STDDEV_SAMP',
  'STR_TO_DURATION',
  'STR_TO_MILLIS',
  'STR_TO_TZ',
  'STR_TO_UTC',
  'STR_TO_ZONE_NAME',
  'SUBSTR',
  'SUFFIXES',
  'SUM',
  'TAN',
  'TITLE',
  'TOARRAY',
  'TOATOM',
  'TOBOOLEAN',
  'TOKENS',
  'TOKENS',
  'TONUMBER',
  'TOOBJECT',
  'TOSTRING',
  'TRIM',
  'TRUNC',
  // 'TYPE', // disabled
  'UPPER',
  'UUID',
  'VARIANCE',
  'VARIANCE_POP',
  'VARIANCE_SAMP',
  'VAR_POP',
  'VAR_SAMP',
  'WEEKDAY_MILLIS',
  'WEEKDAY_STR',
];

/**
 * Priority 5 (last)
 * Full list of reserved words
 * any words that are in a higher priority are removed
 */
// https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/reservedwords.html
const reservedKeywords = [
  'ALL',
  'ALTER',
  'ANALYZE',
  'ANY',
  'ARRAY',
  'AS',
  'ASC',
  'AT',
  'BEGIN',
  'BETWEEN',
  'BINARY',
  'BOOLEAN',
  'BREAK',
  'BUCKET',
  'BUILD',
  'BY',
  'CALL',
  'CAST',
  'CHAR', // verify
  'CLUSTER',
  'COLLATE',
  'COLLECTION',
  'COMMIT',
  'COMMITTED',
  'CONNECT',
  'CONTINUE',
  'CORRELATE',
  'CORRELATED',
  'COVER',
  'CREATE',
  'CURRENT',
  'DATABASE',
  'DATASET',
  'DATASTORE',
  'DECLARE',
  'DECREMENT',
  'DERIVED',
  'DESC',
  'DESCRIBE',
  'DISTINCT',
  'DO',
  'DROP',
  'EACH',
  'ELEMENT',
  'EVERY',
  'EXCLUDE',
  'EXISTS',
  'FALSE',
  'FETCH',
  'FILTER',
  'FIRST',
  'FLATTEN',
  'FLUSH',
  'FOLLOWING',
  'FOR',
  'FORCE',
  'FTS',
  'FUNCTION',
  'GOLANG',
  'GROUP',
  'GROUPS',
  'GSI',
  'HASH',
  'IF',
  'IGNORE',
  'ILIKE',
  'IN',
  'INCLUDE',
  'INCREMENT',
  'INDEX',
  'INLINE',
  'INNER',
  'INTO',
  'IS',
  'ISOLATION',
  'JAVASCRIPT',
  'KEY',
  'KEYS',
  'KEYSPACE',
  'KNOWN',
  'LANGUAGE',
  'LAST',
  'LEFT',
  'LETTING',
  'LEVEL',
  'LIKE',
  'LSM',
  'MAP',
  'MAPPING',
  'MATCHED',
  'MATERIALIZED',
  'MISSING',
  'NAMESPACE',
  'NL',
  'NO',
  'NOT',
  'NULL',
  'NULLS',
  'NUMBER',
  'OBJECT',
  'OFFSET',
  'OPTION',
  'OPTIONS',
  'ORDER',
  'OTHERS',
  'OUTER',
  'OVER',
  'PARSE',
  'PARTITION',
  'PASSWORD',
  'PATH',
  'POOL',
  'PRECEDING',
  'PRIMARY',
  'PRIVATE',
  'PRIVILEGE',
  'PROBE',
  'PROCEDURE',
  'PUBLIC',
  'RANGE',
  'RAW',
  'REALM',
  'REDUCE',
  'RENAME',
  'RESPECT',
  'RETURN',
  'RIGHT',
  'ROLE',
  'ROLLBACK',
  'ROW',
  'ROWS',
  'SATISFIES',
  'SCHEMA',
  'SCOPE',
  'SELF',
  'SEMI',
  'SOME',
  'START',
  'STATISTICS',
  'STRING',
  'SYSTEM',
  'THEN',
  'TIES',
  'TO',
  'TRAN',
  'TRANSACTION',
  'TRIGGER',
  'TRUE',
  'TRUNCATE',
  'UNBOUNDED',
  'UNDER',
  'UNIQUE',
  'UNKNOWN',
  'UNSET',
  'USE',
  'USER',
  'VALIDATE',
  'VALUE',
  'VALUED',
  'VIA',
  'VIEW',
  'WHILE',
  'WINDOW',
  'WITHIN',
  'WORK',
];

/**
 * Priority 1 (first)
 * keywords that begin a new statement
 * will begin new indented block
 */
// https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/reservedwords.html
const reservedCommands = [
  'ADVISE',
  'ALTER INDEX',
  'BEGIN TRANSACTION',
  'BUILD INDEX',
  'COMMIT TRANSACTION',
  'CREATE COLLECTION',
  'CREATE FUNCTION',
  'CREATE INDEX',
  'CREATE PRIMARY INDEX',
  'CREATE SCOPE',
  'CREATE TABLE', // verify
  'DELETE',
  'DELETE FROM',
  'DROP COLLECTION',
  'DROP FUNCTION',
  'DROP INDEX',
  'DROP PRIMARY INDEX',
  'DROP SCOPE',
  'EXECUTE',
  'EXECUTE FUNCTION',
  'EXPLAIN',
  'GRANT',
  'INFER',
  'INSERT',
  'MERGE',
  'PREPARE',
  'RETURNING',
  'REVOKE',
  'ROLLBACK TRANSACTION',
  'SAVEPOINT',
  'SELECT',
  'SET TRANSACTION',
  'UPDATE',
  'UPDATE STATISTICS',
  'UPSERT',
  // other
  'DROP TABLE', // verify,
  'FROM',
  'GROUP BY',
  'HAVING',
  'INSERT INTO',
  'LET',
  'LIMIT',
  'OFFSET',
  'NEST',
  'ORDER BY',
  'SET CURRENT SCHEMA',
  'SET SCHEMA',
  'SET',
  'SHOW',
  'UNNEST',
  'USE KEYS',
  'VALUES',
  'WHERE',
  'WITH',
];

/**
 * Priority 2
 * commands that operate on two tables or subqueries
 * two main categories: joins and boolean set operators
 */
const reservedBinaryCommands = [
  // set booleans
  'INTERSECT',
  'INTERSECT ALL',
  'INTERSECT DISTINCT',
  'UNION',
  'UNION ALL',
  'UNION DISTINCT',
  'EXCEPT',
  'EXCEPT ALL',
  'EXCEPT DISTINCT',
  'MINUS',
  'MINUS ALL',
  'MINUS DISTINCT',
  // joins
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'LEFT OUTER JOIN',
  'RIGHT JOIN',
  'RIGHT OUTER JOIN',
];

/**
 * Priority 3
 * keywords that follow a previous Statement, must be attached to subsequent data
 * can be fully inline or on newline with optional indent
 */
const reservedDependentClauses = ['WHEN', 'ELSE'];

// For reference: http://docs.couchbase.com.s3-website-us-west-1.amazonaws.com/server/6.0/n1ql/n1ql-language-reference/index.html
export default class N1qlFormatter extends Formatter {
  static reservedCommands = reservedCommands;
  static reservedBinaryCommands = reservedBinaryCommands;
  static reservedDependentClauses = reservedDependentClauses;
  static reservedJoinConditions = ['ON', 'USING'];
  static reservedLogicalOperators = ['AND', 'OR', 'XOR'];
  static reservedKeywords = dedupe([...reservedKeywords, ...reservedFunctions]);
  static stringTypes: StringPatternType[] = [`""`, "''", '``'];
  static blockStart = ['(', '[', '{', 'CASE'];
  static blockEnd = [')', ']', '}', 'END'];
  static namedPlaceholderTypes = ['$'];
  static lineCommentTypes = ['#', '--'];
  static operators = ['=='];

  tokenizer() {
    return new Tokenizer({
      reservedCommands: N1qlFormatter.reservedCommands,
      reservedBinaryCommands: N1qlFormatter.reservedBinaryCommands,
      reservedDependentClauses: N1qlFormatter.reservedDependentClauses,
      reservedJoinConditions: N1qlFormatter.reservedJoinConditions,
      reservedLogicalOperators: N1qlFormatter.reservedLogicalOperators,
      reservedKeywords: N1qlFormatter.reservedKeywords,
      stringTypes: N1qlFormatter.stringTypes,
      blockStart: N1qlFormatter.blockStart,
      blockEnd: N1qlFormatter.blockEnd,
      namedPlaceholderTypes: N1qlFormatter.namedPlaceholderTypes,
      lineCommentTypes: N1qlFormatter.lineCommentTypes,
      operators: N1qlFormatter.operators,
    });
  }
}
