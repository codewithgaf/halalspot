<?php

namespace App\Support;

use RuntimeException;

/**
 * @phpstan-type Locality array{code: string, name: string, region: string, province: string|null}
 */
final class PhilippineLocalityDirectory
{
    /**
     * @return list<Locality>
     */
    public function all(): array
    {
        $json = file_get_contents(resource_path('data/philippine-cities.json'));

        if ($json === false) {
            throw new RuntimeException('Unable to read the Philippine locality directory.');
        }

        /** @var list<Locality> $localities */
        $localities = json_decode(
            $json,
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        return $localities;
    }

    /**
     * @return list<string>
     */
    public function codes(): array
    {
        return array_column($this->all(), 'code');
    }

    /**
     * @return list<Locality>
     */
    public function search(string $query, int $limit = 10): array
    {
        $matches = array_filter(
            $this->all(),
            fn (array $city): bool => mb_stripos($city['name'], $query) !== false
        );

        return array_slice(array_values($matches), 0, $limit);
    }

    /**
     * @return Locality|null
     */
    public function find(string $code): ?array
    {
        foreach ($this->all() as $city) {
            if ($city['code'] === $code) {
                return $city;
            }
        }

        return null;
    }
}
