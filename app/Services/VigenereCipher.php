<?php

namespace App\Services;

class VigenereCipher
{
    private string $key;

    public function __construct(string $key = null)
    {
        $this->key = $key ?? config('app.vigenere_key', 'SHIELDTECH');
    }

    public function encrypt(string $plaintext): string
    {
        $result = '';
        $keyLen = strlen($this->key);
        $j = 0;

        for ($i = 0; $i < strlen($plaintext); $i++) {
            $char = $plaintext[$i];

            if (ctype_alpha($char)) {
                $isUpper = ctype_upper($char);
                $base = $isUpper ? ord('A') : ord('a');
                $keyChar = strtoupper($this->key[$j % $keyLen]);
                $shift = ord($keyChar) - ord('A');
                $encrypted = chr(((ord(strtoupper($char)) - ord('A') + $shift) % 26) + $base);
                $result .= $isUpper ? $encrypted : strtolower($encrypted);
                $j++;
            } else {
                $result .= $char;
            }
        }

        return $result;
    }

    public function decrypt(string $ciphertext): string
    {
        $result = '';
        $keyLen = strlen($this->key);
        $j = 0;

        for ($i = 0; $i < strlen($ciphertext); $i++) {
            $char = $ciphertext[$i];

            if (ctype_alpha($char)) {
                $isUpper = ctype_upper($char);
                $base = $isUpper ? ord('A') : ord('a');
                $keyChar = strtoupper($this->key[$j % $keyLen]);
                $shift = ord($keyChar) - ord('A');
                $decrypted = chr(((ord(strtoupper($char)) - ord('A') - $shift + 26) % 26) + $base);
                $result .= $isUpper ? $decrypted : strtolower($decrypted);
                $j++;
            } else {
                $result .= $char;
            }
        }

        return $result;
    }
}
