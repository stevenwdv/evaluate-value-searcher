import sys
import time

from LeakDetector import LeakDetector

_, needle, haystack = sys.argv
# print(needle)

leak_detector = LeakDetector(
    [needle],
    True,
    ['md5', 'sha1', 'sha256', 'sha512', 'sha_salted_1'],
    3,
    True,
    ['base64', 'urlencode', 'lzstring', 'custom_map_1', 'zlib', 'deflate', 'gzip'],
    3,
    False,
)
res = leak_detector.check_post_data(haystack, 3, True)
print('FOUND' if len(res) else 'MISSED')
start = time.time()
for i in range(0, 200):
    leak_detector.check_post_data(haystack, 3, True)
end = time.time()
print((end - start) / i * 1e3)
