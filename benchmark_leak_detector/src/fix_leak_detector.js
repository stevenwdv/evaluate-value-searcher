// Fixes
LeakDetector.prototype.check_if_in_precompute_pool = function(string) {
	return this._precompute_pool[string?.toString()];
};
LeakDetector.prototype._compute_hashes             = function(string, layers, prev_hashes) {
	for (let h of this._hash_set /*changed*/) {
		let hashed_string = this._hasher.get_hash(h, string);
		if (hashed_string === string) {
			continue;
		}
		let hash_stack                       = [h].concat(prev_hashes ? prev_hashes : [string]);
		this._precompute_pool[hashed_string] = hash_stack;
		if (layers > 1) {
			this._compute_hashes(hashed_string, layers - 1, hash_stack);
		}
	}
};
